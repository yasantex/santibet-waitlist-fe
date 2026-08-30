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
  useSendVerification,
  useTodayQuestion,
} from '../hooks/useCampaign'
import { useCountdown } from '../hooks/useCountdown'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setStanding } from '../redux/campaignSlice'
import { formatMoney } from '../utils/money'

type Stage = 'pick' | 'phone' | 'code' | 'done'

const CODE_LENGTH = 6
const STAGE_ORDER: Stage[] = ['pick', 'phone', 'code', 'done']

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
  const standing = useAppSelector((s) => s.campaign.standing)

  const { activeCampaign, isLoading: campaignLoading } = useActiveCampaign()
  const slug = activeCampaign?.slug ?? null
  const { data: stats } = useCampaignStats(slug)
  const {
    data: todayQuestion,
    isLoading: questionLoading,
    isError: todayQuestionError,
  } = useTodayQuestion(slug)
  const { data: meData } = useMe(slug)
  const closes = useCountdown(todayQuestion?.closesAt)

  const knownReturningPlayer = Boolean(standing)

  const predictMutation = usePredict(slug)
  const confirmMutation = useConfirmVerification(slug)
  const resendMutation = useSendVerification(slug)

  const [pickedSide, setPickedSide] = useState<PredictionSide | null>(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('pick')
  const [destination, setDestination] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
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

  const showPhoneStep = !knownReturningPlayer
  const canSubmit = knownReturningPlayer || phone.trim().length > 0

  const yesPercent = stats?.today?.yesPercent
  const noPercent = yesPercent != null ? 100 - yesPercent : undefined
  const yesPercentLabel =
    yesPercent != null ? `${yesPercent}%` : 'No predictions yet'
  const noPercentLabel =
    noPercent != null ? `${noPercent}%` : 'No predictions yet'
  const alreadyPredicted = (
    stats?.today?.predictions ?? stats?.totalPredictions ?? 0
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
  }

  async function handleSubmit() {
    if (!pickedSide || !slug) return
    setErrorMsg(null)
    try {
      const result = await predictMutation.mutateAsync({
        choice: pickedSide.toUpperCase() as 'YES' | 'NO',
        phone: knownReturningPlayer ? undefined : phone.trim(),
        referralCode,
      })
      if (result.status === 'AWAITING_CODE') {
        setDestination(result.destination ?? '')
        setStage('code')
        setResendCooldown(60)
      } else {
        setStage('done')
      }
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err, 'Something went wrong. Please try again.'),
      )
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
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err, 'That code is invalid or has expired.'),
      )
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return
    setErrorMsg(null)
    try {
      const result = await resendMutation.mutateAsync({ phone: phone.trim() })
      setDestination(result.destination)
      setResendCooldown(60)
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          'Could not resend the code — try again shortly.',
        ),
      )
    }
  }

  function handleCodeBoxChange(index: number, raw: string) {
    const char = raw.replace(/\D/g, '').slice(-1)
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

  function handleCodePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    setCode(pasted)
    codeBoxRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
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
  }

  const submitting = predictMutation.isPending || confirmMutation.isPending

  const loading = campaignLoading || (Boolean(slug) && questionLoading)

  return (
    <div className='mx-auto max-w-140'>
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
                    Make Today&apos;s Call
                  </div>
                  <div className='mb-5.5 font-display text-[26px] leading-8 font-black text-ink'>
                    {todayQuestion!.text}
                  </div>

                  <div className='mb-5 flex md:flex-row flex-col gap-3'>
                    <button
                      type='button'
                      onClick={() => handlePick('yes')}
                      aria-pressed={pickedSide === 'yes'}
                      className='relative flex-1 overflow-hidden rounded-xl border-2 border-dark bg-lime px-3.5 py-4 text-left text-[19px] font-black text-lime-ink transition-colors dark:border-lime-ink'
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
                      className='relative flex-1 overflow-hidden rounded-xl border-2 border-border bg-surface px-3.5 py-4 text-left font-display text-[19px] font-black tracking-wide text-ink transition-colors'
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
                        Called by
                      </div>
                      <div className='text-[15px] font-bold text-ink'>
                        {alreadyPredicted}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='mb-1 text-[10.5px] font-bold tracking-[0.06em] text-neutral-10 uppercase'>
                        Prize pool today
                      </div>
                      <div className='text-[15px] font-bold text-ink'>
                        {prizePoolLabel}
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
                        ? 'Nice call. One step to lock it in.'
                        : 'Nice call. Tap confirm to lock it in.'}
                    </span>
                  </div>

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
                          placeholder='801 234 5678'
                          aria-label='Mobile number'
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className='min-w-0 flex-1 rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2 text-[15px] font-semibold text-ink placeholder:text-placeholder placeholder:font-normal'
                        />
                      </div>
                      <div className='mb-4 text-[11px] text-muted'>
                        We only use this to save your call and send your OTP
                        — no spam, ever.
                      </div>
                    </>
                  )}

                  <button
                    type='button'
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className={`w-full rounded-xl px-6 py-3.75 font-black transition-colors ${
                      canSubmit && !submitting
                        ? 'cursor-pointer bg-lime text-lime-ink shadow-[0_5px_0_#8FC200]'
                        : 'cursor-not-allowed bg-border text-neutral-10'
                    }`}
                  >
                    {submitting
                      ? 'Submitting…'
                      : showPhoneStep
                        ? 'Send Code'
                        : 'Confirm prediction'}
                  </button>

                  {errorMsg && (
                    <div className='mt-2.5 text-[14px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type='button'
                    onClick={() => {
                      setStage('pick')
                      setErrorMsg(null)
                    }}
                    className='mt-3 block w-full cursor-pointer text-center text-xs font-bold text-muted'
                  >
                    ← Change my answer
                  </button>
                </div>
              )}

              {stage === 'code' && (
                <div className='px-7.5 pt-5 pb-6.5'>
                  <div className='mb-4 flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3'>
                    <span className='text-lg'>📱</span>
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
                        maxLength={1}
                        aria-label={`Digit ${i + 1} of verification code`}
                        value={code[i] ?? ''}
                        onChange={(e) =>
                          handleCodeBoxChange(i, e.target.value)
                        }
                        onKeyDown={(e) => handleCodeBoxKeyDown(i, e)}
                        onPaste={handleCodePaste}
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
                    className={`mb-4 text-xs font-bold underline underline-offset-2 ${
                      resendMutation.isPending || resendCooldown > 0
                        ? 'cursor-not-allowed text-neutral-10'
                        : 'cursor-pointer text-dark dark:text-lime'
                    }`}
                  >
                    {resendMutation.isPending
                      ? 'Resending…'
                      : resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Didn't get it? Resend code"}
                  </button>

                  <button
                    type='button'
                    onClick={handleConfirmCode}
                    disabled={code.trim().length !== CODE_LENGTH || submitting}
                    className={`w-full rounded-xl px-6 py-3.75 font-black transition-colors ${
                      code.trim().length === CODE_LENGTH && !submitting
                        ? 'cursor-pointer bg-lime text-lime-ink shadow-[0_5px_0_#8FC200]'
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
                      setErrorMsg(null)
                    }}
                    className='mt-3 block w-full cursor-pointer text-center text-xs font-bold text-muted'
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
                    Your {pickedSide?.toUpperCase()} call is saved. Come back
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
                      className={`shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-[11.5px] font-black transition-colors ${
                        copied
                          ? 'bg-success text-white'
                          : 'bg-dark text-white dark:bg-lime dark:text-lime-ink'
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
                      className='flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-success bg-success/10 px-3 py-3 text-[12.5px] font-bold text-success'
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                    <button
                      type='button'
                      onClick={handleCopy}
                      className='flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface px-3 py-3 text-[12.5px] font-bold text-ink'
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
    </div>
  )
}
