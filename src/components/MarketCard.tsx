'use client'

import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Clock01Icon, HelpCircleIcon } from '@hugeicons/core-free-icons'
import { PredictionSide } from '../utils/types'
import {
  getApiErrorMessage,
  useActiveCampaign,
  useCampaignRules,
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
import {
  numberProven,
  numberVerified,
  setStanding,
  switchNumber,
} from '../redux/campaignSlice'
import { errorInfo, formatMoney, trackEvent } from '../utils/constants'
import type { PredictionParticipant } from '../types/campaign'
import WaitlistRulesModal from './modals/WaitlistRulesModal'
import HowToPlayModal from './modals/HowToPlayModal'
import PickStep from './market-card/PickStep'
import PhoneStep from './market-card/PhoneStep'
import CodeStep from './market-card/CodeStep'
import DoneStep from './market-card/DoneStep'
import ThankYou from './market-card/ThankYou'
import {
  CODE_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  formatPhoneDisplay,
  maskPhone,
  type Stage,
} from './market-card/utils'

/** The API's ALREADY_PREDICTED message says "today", which is wrong once two questions can
 *  open on one calendar date — say it in our own words. */
function predictErrorMessage(err: unknown, fallback: string) {
  return errorInfo(err).error_code === 'ALREADY_PREDICTED'
    ? "You've already answered this one."
    : getApiErrorMessage(err, fallback)
}

export default function MarketCard() {
  const dispatch = useAppDispatch()
  const cachedStanding = useAppSelector((s) => s.campaign.standing)
  const savedNumbers = useAppSelector((s) => s.campaign.numbers)
  const currentPhone = useAppSelector((s) => s.campaign.currentPhone)

  const { activeCampaign, isLoading: campaignLoading } = useActiveCampaign()
  const slug = activeCampaign?.slug ?? null
  const { data: stats } = useCampaignStats(slug)
  const { data: rules } = useCampaignRules(slug)
  const {
    data: todayQuestion,
    isLoading: questionLoading,
    isError: todayQuestionError,
    error: todayQuestionErrorDetail,
    refetch: refetchTodayQuestion,
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
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('pick')
  const [destination, setDestination] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailSent, setEmailSent] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [howToOpen, setHowToOpen] = useState(false)
  const [thankYouOpen, setThankYouOpen] = useState(false)
  const closeThankYou = useCallback(() => setThankYouOpen(false), [])
  const [placedUnproven, setPlacedUnproven] = useState(false)
  /** Who the last prediction was placed for, as the predict response reports it. */
  const [placedParticipant, setPlacedParticipant] =
    useState<PredictionParticipant | null>(null)
  const [referralCode] = useState<string | undefined>(() =>
    typeof window === 'undefined'
      ? undefined
      : (new URLSearchParams(window.location.search).get('ref') ?? undefined),
  )

  // A campaign day is not a calendar date: the next question can open the moment this one
  // closes, so a new campaignDay means a fresh card even if the player answered earlier today.
  const openDay = todayQuestion?.campaignDay ?? null
  const [shownDay, setShownDay] = useState(openDay)
  if (openDay !== null && openDay !== shownDay) {
    setShownDay(openDay)
    if (shownDay !== null) {
      setPickedSide(null)
      setCode('')
      setEmailSent(false)
      setPlacedUnproven(false)
      setPlacedParticipant(null)
      setErrorMsg(null)
      setChangingPhone(false)
      setSwitcherOpen(false)
      setThankYouOpen(false)
      setStage('pick')
    }
  }

  // closesAt is only an upper bound on the real deadline, but once it passes the question
  // has certainly closed — check straight away rather than waiting for the next poll.
  const closesReached = closes?.reached ?? false
  useEffect(() => {
    if (closesReached) refetchTodayQuestion()
  }, [closesReached, refetchTodayQuestion])

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
    if (todayQuestionError) {
      trackEvent({
        event: 'page_load_error',
        ...errorInfo(todayQuestionErrorDetail),
      })
    }
  }, [todayQuestionError, todayQuestionErrorDetail])

  const showPhoneStep = !knownReturningPlayer || changingPhone
  const otherSavedNumbers = savedNumbers.filter((n) => n.phone !== currentPhone)
  const predictingAsLabel = knownReturningPlayer
    ? currentPhone
      ? maskPhone(currentPhone)
      : 'your verified number'
    : null
  const closesClock = closes
    ? `${closes.hours}:${closes.mins}:${closes.secs}`
    : '—:—:—'
  // An unproven call was for a number this device holds no key for, so the cached standing
  // belongs to some other number (or there is none) — only the predict response speaks for it.
  const doneFounder = placedUnproven
    ? placedParticipant
    : (placedParticipant ?? standing)
  const submitting = predictMutation.isPending || confirmMutation.isPending
  // Which channel delivered the code the player is about to confirm.
  const verificationMethod = emailSent ? 'email' : 'phone'
  const loading = campaignLoading || (Boolean(slug) && questionLoading)
  // stats.today can describe a different campaign day than the open question.
  const openDayStats =
    stats?.today && stats.today.campaignDay === openDay ? stats.today : null
  const predictionCount = (
    openDayStats?.predictions ??
    stats?.totalPredictions ??
    0
  ).toLocaleString()
  const closesAtLabel = todayQuestion
    ? new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: activeCampaign?.timeZone,
      }).format(new Date(todayQuestion.closesAt))
    : null
  const launchHeadlineTier = rules?.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)[0]
  const grandPrizeLabel = launchHeadlineTier
    ? formatMoney(launchHeadlineTier.amount, { compact: true })
    : '₦1M'

  function startCodeEntry(sentTo: string, cooldown = RESEND_COOLDOWN_SECONDS) {
    setDestination(sentTo)
    setCode('')
    setResendCooldown(cooldown)
    setStage('code')
    trackEvent({
      event: 'verification_started',
      form_name: 'waitlist',
      verification_method: 'phone',
    })
  }

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
      // Always name the number: the device's keys no longer decide who a call is for.
      // Only a device verified before numbers were remembered has no current one.
      const predictPhone = showPhoneStep
        ? phone.trim()
        : (currentPhone ?? undefined)
      const result = await predictMutation.mutateAsync({
        choice: pickedSide.toUpperCase() as 'YES' | 'NO',
        phone: predictPhone,
        referralCode,
      })
      // Only a number the backend has never verified asks for a code. One that has
      // predicted before lands straight away — unproven if this device holds no key for it.
      if (result.status === 'AWAITING_CODE') {
        startCodeEntry(result.destination ?? '')
        return
      }
      setPlacedUnproven(result.proven === false)
      setPlacedParticipant(
        result.participantNumber != null && result.referralCode
          ? {
              participantNumber: result.participantNumber,
              referralCode: result.referralCode,
              rank: result.rank ?? null,
            }
          : null,
      )
      // Proven means this device holds the number's key, so it's one we can play as.
      if (predictPhone && result.proven !== false) {
        dispatch(numberProven(predictPhone))
      }
      setChangingPhone(false)
      setStage('done')
      setThankYouOpen(true)
      trackEvent({ event: 'prediction_confirmed', side: pickedSide })
    } catch (err) {
      const info = errorInfo(err)
      // A code was already sent for this pick — take them back to the code entry
      // instead of dead-ending; resend is available straight away.
      if (info.error_code === 'PREDICTION_AWAITING_CODE') {
        const data = (err as { response?: { data?: { destination?: string } } })
          .response?.data
        startCodeEntry(
          data?.destination ?? `+234 ${formatPhoneDisplay(phone.trim())}`,
          0,
        )
        return
      }
      setErrorMsg(predictErrorMessage(err, 'Something went wrong. Please try again.'))
      // The question may have closed before its countdown ran out — see what's open now.
      refetchTodayQuestion()
      trackEvent({
        event: 'api_request_failed',
        form_name: 'waitlist',
        form_step: 'phone',
        request: 'predict',
        ...info,
      })
      if (!knownReturningPlayer) {
        trackEvent({
          event: 'waitlist_signup_failed',
          form_name: 'waitlist',
          form_step: 'phone',
          ...info,
        })
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
      dispatch(numberVerified({ phone: phone.trim(), standing: result }))
      setChangingPhone(false)
      setPlacedUnproven(false)
      setPlacedParticipant(null)
      setStage('done')
      setThankYouOpen(true)
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
      setErrorMsg(predictErrorMessage(err, 'That code is invalid or has expired.'))
      refetchTodayQuestion()
      const info = errorInfo(err)
      trackEvent({
        event: 'verification_failed',
        form_name: 'waitlist',
        verification_method: verificationMethod,
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

  async function handleResendCode() {
    if (resendCooldown > 0) return
    setErrorMsg(null)
    try {
      const result = await resendMutation.mutateAsync({ phone: phone.trim() })
      setDestination(result.destination)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      trackEvent({
        event: 'verification_code_resent',
        verification_method: 'phone',
      })
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          'Could not resend the code — try again shortly.',
        ),
      )
      trackEvent({
        event: 'api_request_failed',
        form_name: 'waitlist',
        form_step: 'code',
        request: 'resend_code',
        ...errorInfo(err),
      })
    }
  }

  async function handleSendEmailCode(email: string) {
    setErrorMsg(null)
    try {
      const result = await emailVerificationMutation.mutateAsync({
        phone: phone.trim(),
        email,
      })
      setDestination(result.destination)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
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
      trackEvent({
        event: 'api_request_failed',
        form_name: 'waitlist',
        form_step: 'code',
        request: 'email_code',
        ...errorInfo(err),
      })
    }
  }

  function handlePredictAnother() {
    setPickedSide(null)
    setPhone('')
    setCode('')
    setEmailSent(false)
    setPlacedUnproven(false)
    setPlacedParticipant(null)
    setErrorMsg(null)
    setSwitcherOpen(otherSavedNumbers.length > 0)
    setChangingPhone(otherSavedNumbers.length === 0)
    setStage('pick')
  }

  return (
    <div
      id='market'
      className='relative scroll-mt-28 overflow-hidden rounded-[20px] border border-border bg-surface p-4 shadow-[0_8px_32px_rgb(0_0_0/0.08)] sm:p-5 dark:shadow-[0_8px_32px_rgb(0_0_0/0.4)]'
    >
      <span
        aria-hidden='true'
        className='absolute inset-x-0 top-0 h-px bg-linear-90 from-transparent via-lime to-transparent'
      />

      {loading ? (
        <div className='py-10 text-center text-sm text-muted'>
          Loading the question…
        </div>
      ) : !slug || todayQuestionError || !todayQuestion ? (
        <div className='py-10 text-center'>
          <div className='mb-1.5 text-lg font-bold text-foreground'>
            No question open right now
          </div>
          <div className='text-sm text-muted'>
            The next question is coming up — this updates on its own.
          </div>
        </div>
      ) : (
        <>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <span className='flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-muted uppercase'>
              <span className='animate-pulse-dot h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]' />
              Day {todayQuestion.campaignDay} Question
            </span>
            <span
              aria-label={`Closes in ${closesClock}`}
              className='flex items-center gap-1 rounded-full border border-success/40 bg-dark px-2.5 py-1 text-xs font-bold text-lime tabular-nums dark:bg-[#000]/40'
            >
              <HugeiconsIcon icon={Clock01Icon} size={13} />
              {closesClock}
            </span>
          </div>

          <h2 className='mb-4 text-[17px] leading-snug font-semibold tracking-[-0.01em] text-foreground sm:text-lg'>
            {todayQuestion.text}
          </h2>

          <div className='mb-3.5'>
            {stage === 'pick' && (
              <PickStep
                yesPercent={openDayStats?.yesPercent ?? null}
                pickedSide={pickedSide}
                predictingAsLabel={predictingAsLabel}
                onPick={handlePick}
              />
            )}

            {stage === 'phone' && pickedSide && (
              <PhoneStep
                pickedSide={pickedSide}
                predictingAsLabel={predictingAsLabel}
                otherNumbers={otherSavedNumbers}
                enteringNumber={changingPhone}
                switcherOpen={switcherOpen}
                phone={phone}
                submitting={submitting}
                errorMsg={errorMsg}
                onPhoneChange={setPhone}
                onToggleSwitcher={() => {
                  setSwitcherOpen((v) => !v)
                  setErrorMsg(null)
                }}
                onSwitch={(next) => {
                  dispatch(switchNumber(next))
                  setSwitcherOpen(false)
                  setErrorMsg(null)
                }}
                onAddNumber={() => {
                  setSwitcherOpen(false)
                  setChangingPhone(true)
                  setPhone('')
                  setErrorMsg(null)
                }}
                onCancelAddNumber={() => {
                  setChangingPhone(false)
                  setPhone('')
                  setErrorMsg(null)
                }}
                onSubmit={handleSubmit}
                onOpenRules={() => {
                  setRulesOpen(true)
                  trackEvent({
                    event: 'rules_opened',
                    cta_name: 'market_rules_link',
                  })
                }}
                onBack={() => {
                  setStage('pick')
                  setChangingPhone(false)
                  setSwitcherOpen(false)
                  setEmailSent(false)
                  setErrorMsg(null)
                }}
              />
            )}

            {stage === 'code' && (
              <CodeStep
                destination={destination}
                code={code}
                resendCooldown={resendCooldown}
                resending={resendMutation.isPending}
                emailSent={emailSent}
                sendingEmail={emailVerificationMutation.isPending}
                submitting={submitting}
                errorMsg={errorMsg}
                onCodeChange={setCode}
                onResend={handleResendCode}
                onSendEmail={handleSendEmailCode}
                onConfirm={handleConfirmCode}
                onBack={() => {
                  setStage('phone')
                  setEmailSent(false)
                  setErrorMsg(null)
                }}
              />
            )}

            {stage === 'done' && (
              <DoneStep
                pickedSide={pickedSide}
                closesClock={closesClock}
                onViewEntry={() => setThankYouOpen(true)}
                onPredictAnother={handlePredictAnother}
              />
            )}
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted'>
            <span>
              <strong className='font-semibold text-foreground'>{predictionCount}</strong>{' '}
              predictions
            </span>
            <button
              type='button'
              onClick={() => setHowToOpen(true)}
              className='btn-lift flex items-center gap-1 rounded-full border border-dark/20 bg-lime/20 px-2.5 py-1 text-[11px] font-semibold text-dark dark:border-lime/25 dark:bg-lime/10 dark:text-lime'
            >
              <HugeiconsIcon icon={HelpCircleIcon} size={13} />
              How to Play
            </button>
            {closesAtLabel && (
              <span>
                Closes at{' '}
                <strong className='font-semibold text-foreground'>{closesAtLabel}</strong>
              </span>
            )}
          </div>
        </>
      )}

      <ThankYou
        open={thankYouOpen && stage === 'done'}
        pickedSide={pickedSide}
        founder={doneFounder}
        closesClock={closesClock}
        grandPrizeLabel={grandPrizeLabel}
        referralPoints={rules?.scoring.pointsPerReferral ?? null}
        onClose={closeThankYou}
        onPredictAnother={handlePredictAnother}
      />
      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />
      <WaitlistRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </div>
  )
}
