'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight02Icon,
  Cancel01Icon,
  ChampionIcon,
  CrownIcon,
  GiftIcon,
  Mail01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import {
  getApiErrorCode,
  getApiErrorMessage,
  useActiveCampaign,
  useCampaignRules,
  useConfirmVerification,
  useJoinCampaign,
} from '../../hooks/useCampaign'
import { useAppDispatch } from '../../redux/hooks'
import { emailVerified, numberJoined, numberVerified } from '../../redux/campaignSlice'
import {
  WAITLIST_COUNT_LABEL,
  errorInfo,
  formatMoney,
  trackEvent,
  type JoinMethod,
  type WaitlistSource,
} from '../../utils/constants'
import { readReferralCode } from '../../utils/page'
import PhoneField from '../market-card/PhoneField'
import CodeInput from '../market-card/CodeInput'
import ErrorText from '../market-card/ErrorText'
import {
  CODE_LENGTH,
  EMAIL_REGEX,
  INPUT_CLASS,
  NG_PHONE_REGEX,
  PILL_BUTTON_CLASS,
  RESEND_COOLDOWN_SECONDS,
  primaryButtonClass,
} from '../market-card/utils'
import WaitlistRulesModal from './WaitlistRulesModal'

const METHODS: { key: JoinMethod; label: string }[] = [
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
]

function perks(grandPrizeLabel: string) {
  return [
    { icon: GiftIcon, title: 'Daily Prizes', text: 'Cash & airtime before launch' },
    { icon: CrownIcon, title: 'Founder Perks', text: 'Badge, bonus & deposit match' },
    {
      icon: ChampionIcon,
      title: `${grandPrizeLabel} Draw`,
      text: 'Launch day Grand Prize',
    },
  ]
}

/** Seconds the API asks us to wait before resending (429 OTP_COOLDOWN). */
function retryAfterSeconds(err: unknown) {
  const data = (err as { response?: { data?: { retryAfterSeconds?: unknown } } }).response
    ?.data
  return typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : null
}

interface WaitlistModalProps {
  source: WaitlistSource
  /** The campaign lets players join with an email as well as a phone number. */
  allowEmail: boolean
  onClose: () => void
  /** `alreadyJoined`: they were already verified in this campaign, so no code was needed. */
  onJoined: (alreadyJoined: boolean) => void
  /** The campaign switched its join modal off (403 JOIN_REQUIRES_PREDICTION). */
  onModalDisabled: () => void
}

/** "Join the Waitlist" with a phone number or email, confirmed once with a code. */
export default function WaitlistModal({
  source,
  allowEmail,
  onClose,
  onJoined,
  onModalDisabled,
}: WaitlistModalProps) {
  const dispatch = useAppDispatch()
  const { activeCampaign } = useActiveCampaign()
  const slug = activeCampaign?.slug ?? null
  const joinMutation = useJoinCampaign(slug)
  const confirmMutation = useConfirmVerification(slug)
  const { data: rules } = useCampaignRules(slug)
  const launchHeadlineTier = rules?.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)[0]
  // Falls back to the static figure until /rules loads.
  const grandPrizeLabel = launchHeadlineTier
    ? formatMoney(launchHeadlineTier.amount, { compact: true })
    : '₦1M'

  const [method, setMethod] = useState<JoinMethod>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<'contact' | 'code'>('contact')
  const [destination, setDestination] = useState('')
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [referralCode] = useState(readReferralCode)

  // Email may have been switched off since the tab was picked.
  const joinMethod: JoinMethod = allowEmail ? method : 'phone'
  const contact = joinMethod === 'phone' ? { phone } : { email: email.trim() }
  const joining = joinMutation.isPending
  const confirming = confirmMutation.isPending
  const contactValid =
    joinMethod === 'phone' ? NG_PHONE_REGEX.test(phone) : EMAIL_REGEX.test(email.trim())
  const canJoin = contactValid && Boolean(slug) && !joining
  const canConfirm = code.length === CODE_LENGTH && !confirming

  useEffect(() => {
    trackEvent({ event: 'waitlist_modal_view', source })
  }, [source])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => setResendCooldown((s) => Math.max(s - 1, 0)), 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      // The rules modal on top handles its own Escape.
      if (e.key === 'Escape' && !rulesOpen) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, rulesOpen])

  /** Handles /join errors shared by the first send and resends. Returns the error info. */
  function handleJoinError(err: unknown, request: string) {
    const apiCode = getApiErrorCode(err)
    const info = errorInfo(err)
    trackEvent({
      event: 'api_request_failed',
      form_name: 'waitlist',
      form_step: stage === 'code' ? 'code' : 'join',
      request,
      ...info,
    })
    if (apiCode === 'JOIN_REQUIRES_PREDICTION') {
      onModalDisabled()
      return info
    }
    if (apiCode === 'OTP_COOLDOWN') {
      const wait = retryAfterSeconds(err)
      if (wait) setResendCooldown(wait)
      setErrorMsg(
        wait
          ? `A code was just sent. You can ask again in ${wait}s.`
          : 'A code was just sent. Please wait a moment before asking again.',
      )
      return info
    }
    if (apiCode === 'EMAIL_JOIN_DISABLED') {
      setMethod('phone')
      setErrorMsg('Email sign-up is off for now. Join with your phone number instead.')
      return info
    }
    setErrorMsg(getApiErrorMessage(err, 'Could not join the waitlist. Please try again.'))
    return info
  }

  async function handleJoin() {
    if (!canJoin) return
    setErrorMsg(null)
    trackEvent({
      event: 'waitlist_form_submit',
      form_name: 'waitlist',
      form_step: 'join',
      source,
      join_method: joinMethod,
    })
    try {
      const result = await joinMutation.mutateAsync({ ...contact, referralCode })
      if (result.status === 'JOINED') {
        if (joinMethod === 'phone') dispatch(numberJoined(phone))
        onJoined(true)
        return
      }
      setDestination(result.destination ?? '')
      setCode('')
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      setStage('code')
      trackEvent({
        event: 'verification_started',
        form_name: 'waitlist',
        verification_method: joinMethod,
      })
    } catch (err) {
      const info = handleJoinError(err, 'join')
      // A cooldown means a code is already on its way — let them enter it.
      if (getApiErrorCode(err) === 'OTP_COOLDOWN') {
        setStage('code')
        return
      }
      trackEvent({
        event: 'waitlist_signup_failed',
        form_name: 'waitlist',
        form_step: 'join',
        ...info,
      })
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || joining) return
    setErrorMsg(null)
    try {
      const result = await joinMutation.mutateAsync({ ...contact, referralCode })
      if (result.status === 'JOINED') {
        if (joinMethod === 'phone') dispatch(numberJoined(phone))
        onJoined(true)
        return
      }
      if (result.destination) setDestination(result.destination)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      trackEvent({ event: 'verification_code_resent', verification_method: joinMethod })
    } catch (err) {
      handleJoinError(err, 'resend_code')
    }
  }

  async function handleConfirm() {
    if (!canConfirm) return
    setErrorMsg(null)
    try {
      const standing = await confirmMutation.mutateAsync({ ...contact, code })
      dispatch(
        joinMethod === 'phone'
          ? numberVerified({ phone, standing })
          : emailVerified(standing),
      )
      trackEvent({
        event: 'verification_completed',
        form_name: 'waitlist',
        verification_method: joinMethod,
      })
      trackEvent({
        event: 'waitlist_signup_success',
        form_name: 'waitlist',
        referred: Boolean(referralCode),
        source,
        join_method: joinMethod,
      })
      onJoined(false)
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'That code is invalid or has expired.'))
      const info = errorInfo(err)
      trackEvent({
        event: 'verification_failed',
        form_name: 'waitlist',
        verification_method: joinMethod,
        ...info,
      })
      trackEvent({
        event: 'api_request_failed',
        form_name: 'waitlist',
        form_step: 'code',
        request: 'confirm_code',
        ...info,
      })
    }
  }

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='waitlist-title'
      className='fixed inset-0 z-999 flex items-center justify-center p-4'
    >
      <div
        aria-hidden='true'
        onClick={onClose}
        className='absolute inset-0 bg-[#000]/70 backdrop-blur-sm'
      />

      {/* *:shrink-0 keeps sections at full height so a short screen scrolls instead of clipping them. */}
      <div className='animate-slide-up modal-scroll relative flex max-h-[90dvh] w-full max-w-110 flex-col items-center overflow-y-auto rounded-2xl border border-border bg-surface px-5 pt-6 pb-5 text-center shadow-[0_20px_60px_rgb(0_0_0/0.45)] *:shrink-0 sm:max-w-130 sm:px-8 sm:pt-8'>
        <span
          aria-hidden='true'
          className='absolute inset-x-0 top-0 h-px bg-linear-90 from-transparent via-lime to-transparent'
        />
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors hover:bg-border hover:text-foreground'
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} />
        </button>

        <Image
          src='/Santibet Logo.svg'
          alt='SantiBet'
          width={100}
          height={40}
          className='mb-4 h-7 w-auto dark:invert'
        />

        <h2
          id='waitlist-title'
          className='animate-gradient-text mb-2 bg-linear-135 from-dark via-success to-dark text-[clamp(26px,7vw,36px)] leading-[1.1] font-extrabold tracking-[-0.02em] dark:from-lime dark:via-success dark:to-lime'
        >
          Join the Waitlist
        </h2>
        <p className='mb-5 max-w-90 text-sm leading-relaxed text-muted'>
          {source === 'add_number'
            ? 'Join with the number or email you want to predict with.'
            : 'Free to join. Predict daily, win airtime, data, and cash before launch.'}
        </p>

        {stage === 'code' ? (
          <div className='w-full'>
            <div className='mb-3 flex items-center justify-between gap-3 text-left'>
              <p className='text-xs leading-snug text-muted'>
                Enter the {CODE_LENGTH}-digit code sent to{' '}
                <strong className='font-semibold text-foreground'>
                  {destination || (joinMethod === 'phone' ? 'your phone' : 'your email')}
                </strong>
              </p>
              <button
                type='button'
                onClick={() => {
                  setStage('contact')
                  setCode('')
                  setErrorMsg(null)
                }}
                className={`${PILL_BUTTON_CLASS} shrink-0`}
              >
                Change
              </button>
            </div>

            <CodeInput value={code} onChange={setCode} />

            <div className='mb-3 text-xs text-muted'>
              {joining ? (
                'Resending…'
              ) : resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                <>
                  Didn&apos;t get it?{' '}
                  <button
                    type='button'
                    onClick={handleResend}
                    className='link-action font-semibold text-dark dark:text-lime'
                  >
                    Resend code
                  </button>
                </>
              )}
            </div>

            <button
              type='button'
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`${primaryButtonClass(canConfirm)} h-13! text-base! lg:h-14!`}
            >
              {confirming
                ? 'Verifying…'
                : code.length === CODE_LENGTH
                  ? 'Verify & Join'
                  : 'Enter the code'}
            </button>
          </div>
        ) : (
          <>
            <div className='w-full text-left'>
              {allowEmail && (
                <div
                  role='tablist'
                  aria-label='Join with'
                  className='mb-3 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-2 p-1'
                >
                  {METHODS.map((m) => (
                    <button
                      key={m.key}
                      type='button'
                      role='tab'
                      aria-selected={joinMethod === m.key}
                      onClick={() => {
                        setMethod(m.key)
                        setErrorMsg(null)
                      }}
                      className={`h-9 cursor-pointer rounded-lg text-sm font-semibold transition-colors ${
                        joinMethod === m.key
                          ? 'bg-lime text-lime-ink shadow-[0_2px_10px_rgb(191_250_0/0.3)]'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}

              {joinMethod === 'phone' ? (
                <PhoneField
                  id='waitlist-phone'
                  label='Your mobile number'
                  value={phone}
                  onChange={(next) => {
                    setPhone(next)
                    setErrorMsg(null)
                  }}
                  formStep='join'
                  autoFocus
                  onEnter={handleJoin}
                />
              ) : (
                <div className='mb-2'>
                  <label
                    htmlFor='waitlist-email'
                    className='mb-1.5 block text-xs font-semibold text-muted'
                  >
                    Your email address
                  </label>
                  <div className='relative flex'>
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      size={16}
                      className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted'
                    />
                    <input
                      id='waitlist-email'
                      type='email'
                      autoComplete='email'
                      autoFocus
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setErrorMsg(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleJoin()
                      }}
                      className={`${INPUT_CLASS} border-border pl-10`}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type='button'
              onClick={handleJoin}
              disabled={!canJoin}
              className={`${primaryButtonClass(canJoin)} mt-1 h-13! text-base! lg:h-14!`}
            >
              {joining ? 'Joining…' : 'Join the Waitlist'}
              {!joining && (
                <HugeiconsIcon icon={ArrowRight02Icon} size={20} strokeWidth={2} />
              )}
            </button>
          </>
        )}

        {errorMsg && <ErrorText className='mt-2.5'>{errorMsg}</ErrorText>}

        <div className='mt-4 flex items-center justify-center gap-1.5 text-xs text-muted'>
          <HugeiconsIcon icon={UserGroupIcon} size={15} className='text-success' />
          Join{' '}
          <strong className='font-semibold text-foreground'>
            {WAITLIST_COUNT_LABEL}
          </strong>{' '}
          users already on the list
        </div>

        <div className='mt-5 grid w-full grid-cols-3 gap-2 border-t border-border pt-5'>
          {perks(grandPrizeLabel).map((perk) => (
            <div key={perk.title} className='flex flex-col items-center gap-1 px-0.5'>
              <span className='mb-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-lime/20 text-dark dark:bg-lime/10 dark:text-lime'>
                <HugeiconsIcon icon={perk.icon} size={16} />
              </span>
              <span className='text-[11px] font-bold text-foreground sm:text-xs'>
                {perk.title}
              </span>
              <span className='text-[10px] leading-snug text-muted sm:text-[11px]'>
                {perk.text}
              </span>
            </div>
          ))}
        </div>

        <div className='mt-5 text-xs text-muted'>
          Already on the list?{' '}
          <button
            type='button'
            onClick={onClose}
            className='link-action font-semibold text-dark dark:text-lime'
          >
            Predict and win daily.
          </button>
        </div>
        <div className='mt-2 text-[11px] text-muted'>
          By joining, you agree to our{' '}
          <button
            type='button'
            onClick={() => {
              setRulesOpen(true)
              trackEvent({ event: 'rules_opened', cta_name: 'waitlist_modal_rules_link' })
            }}
            className='link-action font-semibold text-dark dark:text-lime'
          >
            Waitlist &amp; Prediction Rules
          </button>
          .
        </div>
      </div>

      <WaitlistRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>,
    document.body,
  )
}
