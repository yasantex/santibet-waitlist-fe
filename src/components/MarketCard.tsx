'use client'

import { useEffect, useRef, useState } from 'react'
import { PredictionSide } from '../utils/types'
import {
  getApiErrorMessage,
  useActiveCampaign,
  useCampaignStats,
  useConfirmVerification,
  useMe,
  usePredict,
  useSendEmailVerification,
  useSendVerification,
  useTodayQuestion,
} from '../hooks/useCampaign'
import { useCountdown } from '../hooks/useCountdown'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setStanding } from '../redux/campaignSlice'
import { formatMoney } from '../utils/money'
import { errorInfo, trackEvent } from '../utils/analytics'
import WaitlistRulesModal from './WaitlistRulesModal'

type Stage = 'pick' | 'phone' | 'code' | 'done'

const CODE_LENGTH = 6
const STAGE_ORDER: Stage[] = ['pick', 'phone', 'code', 'done']
// Nigerian mobile numbers: 10 digits after the leading 0, starting 7/8/9.
const NG_PHONE_REGEX = /^[789]\d{9}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// After this many SMS resends, offer to send the code by email instead.
const EMAIL_FALLBACK_AFTER_RESENDS = 1

function formatPhoneDisplay(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
    .filter(Boolean)
    .join(' ')
}

function CheckIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-6 w-6'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m4 12 6 6L20 6' />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M4 20l1.4-4.2A8 8 0 1 1 9 18.5L4 20Z' />
      <path d='M8.5 9.3c0 3.1 2.5 5.6 5.6 5.6' />
    </svg>
  )
}

function StepProgress({ stage }: { stage: Stage }) {
  const currentIndex = STAGE_ORDER.indexOf(stage)
  return (
    <div className='flex gap-1.5 px-7.5 pt-4'>
      {STAGE_ORDER.map((s, i) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full ${
            i <= currentIndex ? 'bg-lime' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}

export default function MarketCard() {
  const dispatch = useAppDispatch()
  const cachedStanding = useAppSelector((s) => s.campaign.standing)

  const { activeCampaign, isLoading: campaignLoading } = useActiveCampaign()
  const slug = activeCampaign?.slug ?? null
  const { data: stats } = useCampaignStats(slug)
  const {
    data: todayQuestion,
    isLoading: questionLoading,
    isError: todayQuestionError,
    error: todayQuestionErrorDetail,
  } = useTodayQuestion(slug)
  const { data: meData } = useMe(slug)
  const standing = meData ?? cachedStanding
  const closes = useCountdown(todayQuestion?.closesAt)

  const knownReturningPlayer = Boolean(standing)

  const predictMutation = usePredict(slug)
  const confirmMutation = useConfirmVerification(slug)
  const resendMutation = useSendVerification(slug)
  const emailVerificationMutation = useSendEmailVerification(slug)

  const [pickedSide, setPickedSide] = useState<PredictionSide | null>(null)
  const [changingPhone, setChangingPhone] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('pick')
  const [destination, setDestination] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendCount, setResendCount] = useState(0)
  const [emailFallbackOpen, setEmailFallbackOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [referralCode] = useState<string | undefined>(() =>
    typeof window === 'undefined'
      ? undefined
      : (new URLSearchParams(window.location.search).get('ref') ?? undefined),
  )

  const codeBoxRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (meData) dispatch(setStanding(meData))
  }, [meData, dispatch])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => {
      setResendCooldown((s) => Math.max(s - 1, 0))
    }, 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  useEffect(() => {
    if (stage === 'code') codeBoxRefs.current[0]?.focus()
  }, [stage])

  useEffect(() => {
    if (todayQuestionError) {
      trackEvent({ event: 'page_load_error', ...errorInfo(todayQuestionErrorDetail) })
    }
  }, [todayQuestionError, todayQuestionErrorDetail])

  const showPhoneStep = !knownReturningPlayer || changingPhone
  const isValidPhone = NG_PHONE_REGEX.test(phone)
  const showPhoneError = phone.length === 10 && !isValidPhone

  // Fires each time the "Enter a valid Nigerian mobile number" message appears.
  useEffect(() => {
    if (showPhoneError) {
      trackEvent({
        event: 'form_validation_error',
        form_name: 'waitlist',
        form_step: 'phone',
        error_type: 'invalid_phone',
      })
    }
  }, [showPhoneError])
  const canSubmit = showPhoneStep ? isValidPhone : true

  const yesPercent = stats?.today?.yesPercent
  const noPercent = yesPercent != null ? 100 - yesPercent : undefined
  const yesPercentLabel =
    yesPercent != null ? `${yesPercent}%` : 'No predictions yet'
  const noPercentLabel =
    noPercent != null ? `${noPercent}%` : 'No predictions yet'
  const alreadyPredicted = (
    stats?.today?.predictions ??
    stats?.totalPredictions ??
    0
  ).toLocaleString()
  const prizePoolLabel = stats?.dailyPrizePool?.[0]
    ? formatMoney(stats.dailyPrizePool[0])
    : '—'
  const closesClock = closes
    ? `${closes.hours}:${closes.mins}:${closes.secs}`
    : '—:—:—'

  function handlePick(side: PredictionSide) {
    setPickedSide(side)
    setErrorMsg(null)
    setStage('phone')
    trackEvent({
      event: 'waitlist_form_start',
      form_name: 'waitlist',
      form_step: 'pick',
      side,
      returning_player: knownReturningPlayer,
    })
  }

  function handlePhoneChange(raw: string) {
    const digits = raw
      .replace(/\D/g, '')
      .replace(/^0+/, '')
      .slice(0, 10)
    setPhone(digits)
  }

  async function handleSubmit() {
    if (!pickedSide || !slug) return
    setErrorMsg(null)
    trackEvent({
      event: 'waitlist_form_submit',
      form_name: 'waitlist',
      form_step: 'phone',
      returning_player: knownReturningPlayer,
    })
    try {
      const result = await predictMutation.mutateAsync({
        choice: pickedSide.toUpperCase() as 'YES' | 'NO',
        phone: showPhoneStep ? phone.trim() : undefined,
        referralCode,
      })
      if (result.status === 'AWAITING_CODE') {
        setDestination(result.destination ?? '')
        setStage('code')
        setResendCooldown(60)
        trackEvent({
          event: 'verification_started',
          form_name: 'waitlist',
          verification_method: 'phone',
        })
      } else {
        setStage('done')
        trackEvent({ event: 'prediction_confirmed', side: pickedSide })
      }
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err, 'Something went wrong. Please try again.'),
      )
      const info = errorInfo(err)
      trackEvent({ event: 'api_request_failed', form_name: 'waitlist', form_step: 'phone', request: 'predict', ...info })
      if (!knownReturningPlayer) {
        trackEvent({ event: 'waitlist_signup_failed', form_name: 'waitlist', form_step: 'phone', ...info })
      }
    }
  }

  async function handleConfirmCode() {
    if (code.trim().length !== CODE_LENGTH) return
    setErrorMsg(null)
    try {
      const result = await confirmMutation.mutateAsync({
        phone: phone.trim(),
        code: code.trim(),
      })
      dispatch(setStanding(result))
      setStage('done')
      trackEvent({
        event: 'verification_completed',
        form_name: 'waitlist',
        verification_method: verificationMethod,
      })
      // Backend has confirmed the player. A returning player re-verifying a
      // changed number isn't a new signup.
      trackEvent(
        knownReturningPlayer
          ? { event: 'prediction_confirmed', side: pickedSide ?? undefined }
          : {
              event: 'waitlist_signup_success',
              form_name: 'waitlist',
              side: pickedSide ?? undefined,
              referred: Boolean(referralCode),
            },
      )
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err, 'That code is invalid or has expired.'),
      )
      const info = errorInfo(err)
      trackEvent({ event: 'verification_failed', form_name: 'waitlist', verification_method: verificationMethod, ...info })
      trackEvent({ event: 'api_request_failed', form_name: 'waitlist', form_step: 'code', request: 'confirm_code', ...info })
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return
    setErrorMsg(null)
    try {
      const result = await resendMutation.mutateAsync({ phone: phone.trim() })
      setDestination(result.destination)
      setResendCooldown(60)
      setResendCount((n) => n + 1)
      trackEvent({ event: 'verification_code_resent', verification_method: 'phone' })
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          'Could not resend the code — try again shortly.',
        ),
      )
      trackEvent({ event: 'api_request_failed', form_name: 'waitlist', form_step: 'code', request: 'resend_code', ...errorInfo(err) })
    }
  }

  async function handleSendEmailCode() {
    if (!EMAIL_REGEX.test(email.trim())) return
    setErrorMsg(null)
    try {
      const result = await emailVerificationMutation.mutateAsync({
        phone: phone.trim(),
        email: email.trim(),
      })
      setDestination(result.destination)
      setResendCooldown(60)
      setEmailSent(true)
      trackEvent({
        event: 'verification_started',
        form_name: 'waitlist',
        verification_method: 'email',
      })
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          'Could not send the code to that email — try again.',
        ),
      )
      trackEvent({ event: 'api_request_failed', form_name: 'waitlist', form_step: 'code', request: 'email_code', ...errorInfo(err) })
    }
  }

  /** Writes several digits into the boxes from `start` (a full code always starts at the first box). */
  function fillCode(start: number, digits: string) {
    const from = digits.length >= CODE_LENGTH ? 0 : start
    const next = (
      code.slice(0, from) +
      digits +
      code.slice(from + digits.length)
    ).slice(0, CODE_LENGTH)
    setCode(next)
    codeBoxRefs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus()
  }

  function handleCodeBoxChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    // SMS autofill and keyboard clipboard suggestions arrive here as the whole code, not as a paste.
    if (digits.length > 2) {
      fillCode(index, digits)
      return
    }
    const char = digits.slice(-1)
    const next = (code.slice(0, index) + char + code.slice(index + 1)).slice(
      0,
      CODE_LENGTH,
    )
    setCode(next)
    if (char && index < CODE_LENGTH - 1) {
      codeBoxRefs.current[index + 1]?.focus()
    }
  }

  function handleCodeBoxKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeBoxRefs.current[index - 1]?.focus()
      setCode(code.slice(0, index - 1) + code.slice(index))
    }
  }

  function handleCodePaste(
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    fillCode(index, pasted)
  }

  const referLink =
    standing && typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${standing.referralCode}`
      : ''
  const founderNumber = standing
    ? `#${standing.participantNumber.toLocaleString()}`
    : ''
  const founderRank =
    standing?.rank != null ? `#${standing.rank.toLocaleString()}` : '—'
  const whatsappHref = referLink
    ? `https://wa.me/?text=${encodeURIComponent(
        `I just made my SantiBet prediction — join me and we both earn Founder points: ${referLink}`,
      )}`
    : undefined

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referLink)
    } catch {
      // clipboard API unavailable — ignore, the input remains selectable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    trackEvent({ event: 'referral_link_copied', cta_name: 'market_copy_link' })
  }

  const submitting = predictMutation.isPending || confirmMutation.isPending
  // Which channel delivered the code the player is about to confirm.
  const verificationMethod = emailSent ? 'email' : 'phone'

  const loading = campaignLoading || (Boolean(slug) && questionLoading)

  return (
    <div className='mx-auto max-w-180'>
      {/* Slip masthead */}
      <div className='flex items-center justify-between rounded-t-2xl bg-dark px-6 py-3 dark:bg-lime'>
        <span className='text-base font-bold uppercase tracking-[0.05em] text-white dark:text-lime-ink'>
          SantiBet Slip
        </span>
        <span
          aria-hidden='true'
          className='barcode h-3 w-16 text-lime dark:text-lime-ink'
        />
      </div>

      {/* Perforated seam + body */}
      <div className='relative'>
        <span className='absolute -top-3 -left-3 h-6 w-6 rounded-full bg-paper' />
        <span className='absolute -top-3 -right-3 h-6 w-6 rounded-full bg-paper' />

        <div className='rounded-b-2xl border-2 border-t-0 border-dark bg-surface dark:border-lime'>
          {loading ? (
            <div className='px-7.5 pt-8.5 pb-8.5 text-center text-lg text-neutral-10'>
              Loading today&apos;s market…
            </div>
          ) : !slug || todayQuestionError ? (
            <div className='px-7.5 pt-8.5 pb-8.5 text-center'>
              <div className='mb-2 font-display text-[22px] font-bold text-ink'>
                No market open right now
              </div>
              <div className='text-lg text-placeholder'>
                Check back soon — a new question opens every campaign day.
              </div>
            </div>
          ) : (
            <>
              <StepProgress stage={stage} />

              {stage === 'pick' && (
                <div className='px-7.5 pt-5 pb-6.5'>
                  <div className='mb-3.5 text-xs font-bold uppercase tracking-[0.05em] text-success'>
                    Make Today&apos;s Prediction
                  </div>
                  <div className='mb-5.5 font-display text-[26px] leading-8 font-black text-ink'>
                    {todayQuestion!.text}
                  </div>

                  <div className='mb-5 flex md:flex-row flex-col gap-3'>
                    <button
                      type='button'
                      onClick={() => handlePick('yes')}
                      aria-pressed={pickedSide === 'yes'}
                      className='btn-lift relative flex-1 overflow-hidden rounded-xl border-2 border-dark bg-lime px-3.5 py-4 text-left text-[19px] font-black text-lime-ink hover:bg-[#cfff3d] dark:border-lime-ink'
                    >
                      <span className='relative z-10 block'>YES</span>
                      <span className='relative z-10 mt-1 block text-[13px] font-semibold text-lime-ink/70'>
                        {yesPercentLabel}
                        {yesPercent != null && ' of predictions'}
                      </span>
                    </button>
                    <button
                      type='button'
                      onClick={() => handlePick('no')}
                      aria-pressed={pickedSide === 'no'}
                      className='btn-lift relative flex-1 overflow-hidden rounded-xl border-2 border-border bg-surface px-3.5 py-4 text-left font-display text-[19px] font-black tracking-wide text-ink hover:border-dark hover:bg-surface-2 dark:hover:border-lime'
                    >
                      <span className='relative z-10 block'>NO</span>
                      <span className='relative z-10 mt-1 block text-[13px] font-semibold text-muted'>
                        {noPercentLabel}
                        {noPercent != null && ' of predictions'}
                      </span>
                    </button>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-dashed border-border pt-4.5'>
                    <div className='text-center'>
                      <div className='mb-1 text-[10.5px] font-bold tracking-[0.06em] text-neutral-10 uppercase'>
                        Closes in
                      </div>
                      <div className='text-[15px] font-bold text-success'>
                        {closesClock}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='mb-1 text-[10.5px] font-bold tracking-[0.06em] text-neutral-10 uppercase'>
                        Predictions made
                      </div>
                      <div className='text-[15px] font-bold text-ink'>
                        {alreadyPredicted}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='mb-1 text-[10.5px] font-bold tracking-[0.06em] text-neutral-10 uppercase'>
                        TODAY'S GIVEAWAY
                      </div>
                      <div className='text-[15px] font-bold text-ink'>
                        {prizePoolLabel} AIRTIME & DATA
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === 'phone' && pickedSide && (
                <div className='px-7.5 pt-5 pb-6.5'>
                  <div className='mb-4 flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3'>
                    <span className='shrink-0 rounded-lg bg-lime px-2.5 py-1.5 text-xs font-black text-lime-ink'>
                      {pickedSide.toUpperCase()}
                    </span>
                    <span className='text-[12.5px] font-semibold text-ink'>
                      {showPhoneStep
                        ? 'Nice pick. One last step to lock it in.'
                        : 'Nice pick. Tap confirm to lock it in.'}
                    </span>
                  </div>

                  {knownReturningPlayer && (
                    <button
                      type='button'
                      onClick={() => {
                        setChangingPhone((v) => !v)
                        setPhone('')
                        setErrorMsg(null)
                      }}
                      className='link-action mb-4 block text-left text-xs font-bold text-dark dark:text-lime'
                    >
                      {changingPhone
                        ? 'Use my saved number instead'
                        : 'Not your number? Change it'}
                    </button>
                  )}

                  {showPhoneStep && (
                    <>
                      <div className='mb-2 text-xs font-bold text-muted'>
                        Your mobile number
                      </div>
                      <div className='mb-1.5 flex gap-2'>
                        <div className='flex items-center rounded-xl border-[1.5px] border-border bg-surface-2 px-3 py-2 text-sm font-bold text-ink'>
                          +234
                        </div>
                        <input
                          type='tel'
                          inputMode='numeric'
                          placeholder='801 234 5678'
                          aria-label='Mobile number'
                          value={formatPhoneDisplay(phone)}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className={`min-w-0 flex-1 rounded-xl border-[1.5px] bg-surface px-3.5 py-2 text-[15px] font-semibold text-ink placeholder:text-placeholder placeholder:font-normal ${
                            showPhoneError
                              ? 'border-error'
                              : 'border-border'
                          }`}
                        />
                      </div>
                      {showPhoneError && (
                        <div className='mb-2 text-[11px] font-bold text-error'>
                          Enter a valid Nigerian mobile number.
                        </div>
                      )}
                      <div className='mb-4 text-[11px] font-bold text-muted'>
                        We’ll text you a verification code to secure your
                        prediction. No spam, ever.
                      </div>
                    </>
                  )}

                  <button
                    type='button'
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className={`w-full rounded-xl px-6 py-3.75 font-black transition-[filter,transform,box-shadow,background-color] ${
                      canSubmit && !submitting
                        ? 'btn-3d [--btn-depth:5px] bg-lime text-lime-ink'
                        : 'cursor-not-allowed bg-border text-neutral-10'
                    }`}
                  >
                    {submitting
                      ? 'Submitting…'
                      : showPhoneStep
                        ? 'Send Verification Code'
                        : 'Confirm prediction'}
                  </button>

                  {errorMsg && (
                    <div className='mt-2.5 text-[14px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}

                  <div className='mt-3 text-center text-[11px] font-medium text-muted'>
                    By continuing, you agree to our{' '}
                    <button
                      type='button'
                      onClick={() => {
                        setRulesOpen(true)
                        trackEvent({ event: 'rules_opened', cta_name: 'market_rules_link' })
                      }}
                      className='link-action font-bold text-dark dark:text-lime'
                    >
                      Waitlist &amp; Prediction Rules
                    </button>
                    .
                  </div>

                  <button
                    type='button'
                    onClick={() => {
                      setStage('pick')
                      setChangingPhone(false)
                      setResendCount(0)
                      setEmailFallbackOpen(false)
                      setEmail('')
                      setEmailSent(false)
                      setErrorMsg(null)
                    }}
                    className='mt-3 block w-full cursor-pointer text-center text-xs font-bold text-muted transition-colors hover:text-[var(--foreground)] hover:underline hover:decoration-lime hover:decoration-2 hover:underline-offset-4 active:opacity-70'
                  >
                    ← Change pick
                  </button>
                </div>
              )}

              {stage === 'code' && (
                <div className='px-7.5 pt-5 pb-6.5'>
                  <div className='mb-4 flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3'>
                    <span className='text-[12.5px] font-semibold text-ink'>
                      Code sent to <strong>{destination}</strong>
                    </span>
                  </div>

                  <div className='mb-2 text-xs font-bold text-muted'>
                    Enter the {CODE_LENGTH}-digit code
                  </div>
                  <div className='mb-3.5 flex gap-2'>
                    {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          codeBoxRefs.current[i] = el
                        }}
                        type='text'
                        inputMode='numeric'
                        // Only the first box offers the SMS code, or the OS suggests it six times.
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        aria-label={`Digit ${i + 1} of verification code`}
                        value={code[i] ?? ''}
                        onChange={(e) => handleCodeBoxChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeBoxKeyDown(i, e)}
                        onPaste={(e) => handleCodePaste(i, e)}
                        onFocus={(e) => e.target.select()}
                        className={`h-13 w-full flex-1 rounded-[10px] border-[1.5px] bg-surface text-center text-xl font-black text-ink transition-colors ${
                          code[i] ? 'border-lime' : 'border-border'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type='button'
                    onClick={handleResendCode}
                    disabled={resendMutation.isPending || resendCooldown > 0}
                    className={`mb-4 text-xs font-bold underline underline-offset-2 transition-opacity ${
                      resendMutation.isPending || resendCooldown > 0
                        ? 'cursor-not-allowed text-neutral-10'
                        : 'link-action text-dark dark:text-lime'
                    }`}
                  >
                    {resendMutation.isPending
                      ? 'Resending…'
                      : resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Didn't get it? Resend code"}
                  </button>

                  {resendCount >= EMAIL_FALLBACK_AFTER_RESENDS &&
                    !emailSent && (
                      <div className='mb-4 -mt-2'>
                        {!emailFallbackOpen ? (
                          <button
                            type='button'
                            onClick={() => setEmailFallbackOpen(true)}
                            className='link-action block text-xs font-bold text-dark dark:text-lime'
                          >
                            Still no code? Request it by email
                          </button>
                        ) : (
                          <div className='rounded-xl bg-surface-2 px-3.5 py-3'>
                            <div className='mb-2 text-xs font-bold text-muted'>
                              We&apos;ll send the code to this email instead
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              <input
                                type='email'
                                placeholder='you@example.com'
                                aria-label='Email address'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='min-w-0 flex-1 rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2 text-[15px] font-semibold text-ink placeholder:text-placeholder placeholder:font-normal'
                              />
                              <button
                                type='button'
                                onClick={handleSendEmailCode}
                                disabled={
                                  !EMAIL_REGEX.test(email.trim()) ||
                                  emailVerificationMutation.isPending
                                }
                                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black transition-[filter,transform,background-color] ${
                                  EMAIL_REGEX.test(email.trim()) &&
                                  !emailVerificationMutation.isPending
                                    ? 'btn-lift bg-lime text-lime-ink hover:bg-[#cfff3d]'
                                    : 'cursor-not-allowed bg-border text-neutral-10'
                                }`}
                              >
                                {emailVerificationMutation.isPending
                                  ? 'Sending…'
                                  : 'Send'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {emailSent && (
                    <div className='mb-4 -mt-2 text-xs font-bold text-success'>
                      Code sent — check your email.
                    </div>
                  )}

                  <button
                    type='button'
                    onClick={handleConfirmCode}
                    disabled={code.trim().length !== CODE_LENGTH || submitting}
                    className={`w-full rounded-xl px-6 py-3.75 font-black transition-[filter,transform,box-shadow,background-color] ${
                      code.trim().length === CODE_LENGTH && !submitting
                        ? 'btn-3d [--btn-depth:5px] bg-lime text-lime-ink'
                        : 'cursor-not-allowed bg-border text-neutral-10'
                    }`}
                  >
                    {submitting ? 'Verifying…' : 'Confirm & Lock In'}
                  </button>

                  {errorMsg && (
                    <div className='mt-2.5 text-[14px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type='button'
                    onClick={() => {
                      setStage('phone')
                      setResendCount(0)
                      setEmailFallbackOpen(false)
                      setEmail('')
                      setEmailSent(false)
                      setErrorMsg(null)
                    }}
                    className='mt-3 block w-full cursor-pointer text-center text-xs font-bold text-muted transition-colors hover:text-[var(--foreground)] hover:underline hover:decoration-lime hover:decoration-2 hover:underline-offset-4 active:opacity-70'
                  >
                    ← Wrong number?
                  </button>
                </div>
              )}

              {stage === 'done' && (
                <div className='px-7.5 pt-6 pb-7.5 text-center'>
                  <div className='mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-lime text-lime-ink'>
                    <CheckIcon />
                  </div>
                  <div className='mb-1 font-display text-[19px] font-black text-ink'>
                    You&apos;re locked in!
                  </div>
                  <div className='mb-4.5 text-[13px] text-muted'>
                    Your {pickedSide?.toUpperCase()} prediction is saved. Come back
                    tomorrow for a new one.
                  </div>

                  <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left'>
                    <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
                      <div className='mb-1 text-[14px] tracking-wide text-neutral-10 uppercase'>
                        Founder Number
                      </div>
                      <div className='text-[17px] font-bold text-success'>
                        {founderNumber}
                      </div>
                    </div>
                    <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
                      <div className='mb-1 text-[14px] tracking-wide text-neutral-10 uppercase'>
                        Current Founder rank
                      </div>
                      <div className='text-[17px] font-bold text-success'>
                        {founderRank}
                      </div>
                    </div>
                  </div>

                  <div className='mb-4.5 inline-flex items-center gap-2.5 rounded-full border border-border bg-paper px-4.5 py-2.5 text-sm text-neutral-10'>
                    Today&apos;s window closes in{' '}
                    <b className='text-[15px] text-ink'>{closesClock}</b>
                  </div>

                  <div className='mb-3.5 flex items-center justify-center gap-2 rounded-full bg-surface-2 px-4 py-2.5 text-[12.5px] font-bold text-ink'>
                    <span>🎯</span>
                    Share your link — you both earn +5 Founder points
                  </div>

                  <div className='mb-3.5 flex items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-border px-3.5 py-3'>
                    <div className='min-w-0 flex-1 truncate text-left text-[12.5px] font-bold text-ink'>
                      {referLink}
                    </div>
                    <button
                      type='button'
                      onClick={handleCopy}
                      className={`btn-lift shrink-0 rounded-lg px-3.5 py-2 text-[11.5px] font-black ${
                        copied
                          ? 'bg-success text-white'
                          : 'bg-dark text-white hover:bg-dark-2 dark:bg-lime dark:text-lime-ink dark:hover:bg-[#cfff3d]'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className='flex gap-2'>
                    <a
                      href={whatsappHref}
                      target='_blank'
                      rel='noreferrer'
                      onClick={() =>
                        trackEvent({
                          event: 'referral_share_click',
                          cta_name: 'market_whatsapp',
                          share_channel: 'whatsapp',
                        })
                      }
                      className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-success bg-success/10 px-3 py-3 text-[12.5px] font-bold text-success hover:bg-success hover:text-white dark:hover:text-lime-ink'
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                    <button
                      type='button'
                      onClick={handleCopy}
                      className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface px-3 py-3 text-[12.5px] font-bold text-ink hover:border-dark hover:bg-surface-2 dark:hover:border-lime'
                    >
                      🔗 Copy Link
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <WaitlistRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </div>
  )
}
