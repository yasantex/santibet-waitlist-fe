'use client'

import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Clock01Icon,
  FlashIcon,
  HelpCircleIcon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons'
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
import {
  WAITLIST_COUNT_LABEL,
  errorInfo,
  formatMoney,
  trackEvent,
} from '../utils/constants'
import { readReferralCode } from '../utils/page'
import type { PredictionParticipant } from '../types/campaign'
import WaitlistRulesModal from './modals/WaitlistRulesModal'
import HowToPlayModal from './modals/HowToPlayModal'
import PickStep from './market-card/PickStep'
import PhoneStep from './market-card/PhoneStep'
import CodeStep from './market-card/CodeStep'
import DoneStep from './market-card/DoneStep'
import ThankYouModal, { isThankYouUrl } from './modals/ThankYouModal'
import { useOpenWaitlist, useThankYouRequests } from './WaitlistContext'
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
  switch (errorInfo(err).error_code) {
    case 'ALREADY_PREDICTED':
      return "You've already answered this one."
    case 'PHONE_IN_USE':
      return 'That number already belongs to another player. Try a different number.'
    default:
      return getApiErrorMessage(err, fallback)
  }
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

  // A remembered number counts too: someone who joined through the modal predicts with it
  // straight away instead of typing it again.
  const knownReturningPlayer = Boolean(standing) || Boolean(currentPhone)
  // With a join modal, a new number is added there (join, then predict) rather than typed here.
  const hasJoinModal = activeCampaign?.joinRequiresPrediction === false
  const openWaitlist = useOpenWaitlist()

  const predictMutation = usePredict(slug)
  const confirmMutation = useConfirmVerification(slug)
  const resendMutation = useSendVerification(slug)
  const emailVerificationMutation = useSendEmailVerification(slug)

  const [pickedSide, setPickedSide] = useState<PredictionSide | null>(null)
  const [changingPhone, setChangingPhone] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [phone, setPhone] = useState('')
  /** The number the code being entered was sent for. */
  const [codePhone, setCodePhone] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('pick')
  const [destination, setDestination] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailSent, setEmailSent] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [howToOpen, setHowToOpen] = useState(false)
  // A visit to ?step=thank-you opens the screen straight away.
  const [thankYouOpen, setThankYouOpen] = useState(isThankYouUrl)
  const closeThankYou = useCallback(() => setThankYouOpen(false), [])
  // A signup through the join modal opens it too.
  const thankYouRequests = useThankYouRequests()
  const [seenThankYouRequests, setSeenThankYouRequests] = useState(thankYouRequests)
  if (thankYouRequests !== seenThankYouRequests) {
    setSeenThankYouRequests(thankYouRequests)
    setThankYouOpen(true)
  }

  /** Opens the thank-you screen after a confirmed prediction and counts the view. */
  function showThankYou(userType: 'new' | 'returning') {
    setThankYouOpen(true)
    trackEvent({ event: 'thank_you_view', user_type: userType })
  }
  const [placedUnproven, setPlacedUnproven] = useState(false)
  /** Who the last prediction was placed for, as the predict response reports it. */
  const [placedParticipant, setPlacedParticipant] =
    useState<PredictionParticipant | null>(null)
  const [referralCode] = useState(readReferralCode)

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

  // An email joiner has no number yet; their first prediction asks for one (no second code).
  const needsPhone = standing?.hasPhone === false
  const showPhoneStep = !knownReturningPlayer || changingPhone || needsPhone
  const otherSavedNumbers = savedNumbers.filter((n) => n.phone !== currentPhone)
  const predictingAsLabel = knownReturningPlayer && !needsPhone
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

  /** Brings the YES / NO buttons into view for a player who has already joined. */
  function scrollToOptions() {
    document
      .getElementById('market-options')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    trackEvent({ event: 'cta_click', cta_name: 'market_predict_now' })
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

  function startCodeEntry(
    forPhone: string,
    sentTo: string,
    cooldown = RESEND_COOLDOWN_SECONDS,
  ) {
    setCodePhone(forPhone)
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

  async function handleSubmit() {
    if (!pickedSide || !slug) return
    setErrorMsg(null)
    // Always name the number: the device's keys no longer decide who a call is for.
    // Only a device verified before numbers were remembered has no current one.
    const predictPhone = showPhoneStep ? phone.trim() : (currentPhone ?? undefined)
    try {
      const result = await predictMutation.mutateAsync({
        choice: pickedSide.toUpperCase() as 'YES' | 'NO',
        phone: predictPhone,
        referralCode,
      })
      // A number not yet verified in this campaign gets a code; the call lands on confirm.
      if (result.status === 'AWAITING_CODE') {
        startCodeEntry(predictPhone ?? '', result.destination ?? '')
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
      showThankYou('returning')
      trackEvent({ event: 'prediction_confirmed', side: pickedSide })
    } catch (err) {
      const info = errorInfo(err)
      // A code was already sent for this pick — take them back to the code entry
      // instead of dead-ending; resend is available straight away.
      if (info.error_code === 'PREDICTION_AWAITING_CODE') {
        const data = (err as { response?: { data?: { destination?: string } } })
          .response?.data
        startCodeEntry(
          predictPhone ?? '',
          data?.destination ?? `+234 ${formatPhoneDisplay(predictPhone ?? '')}`,
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
        phone: codePhone,
        code: code.trim(),
      })
      dispatch(numberVerified({ phone: codePhone, standing: result }))
      setChangingPhone(false)
      setPlacedUnproven(false)
      setPlacedParticipant(null)
      setStage('done')
      showThankYou(knownReturningPlayer ? 'returning' : 'new')
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
              source: 'predict',
              join_method: 'phone',
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
      const result = await resendMutation.mutateAsync({ phone: codePhone })
      setDestination(result.destination)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      trackEvent({
        event: 'verification_code_resent',
        verification_method: 'phone',
      })
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err, 'Could not resend the code — try again shortly.'),
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
        phone: codePhone,
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
        getApiErrorMessage(err, 'Could not send the code to that email — try again.'),
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
    setStage('pick')
    if (otherSavedNumbers.length > 0) {
      setSwitcherOpen(true)
      setChangingPhone(false)
    } else {
      addNumber()
    }
  }

  /** Predict with a number this device hasn't used: join it through the modal first when the
   *  campaign has one, otherwise type it here (it's verified with a code on predicting). */
  function addNumber() {
    setSwitcherOpen(false)
    setErrorMsg(null)
    if (hasJoinModal) {
      setChangingPhone(false)
      openWaitlist('add_number')
      return
    }
    setChangingPhone(true)
    setPhone('')
  }

  return (
    <div
      id='market'
      className='relative scroll-mt-28 overflow-hidden rounded-[20px] border border-border bg-surface p-4 shadow-[0_8px_32px_rgb(0_0_0/0.08)] sm:p-5 lg:flex lg:flex-1 lg:flex-col lg:p-6 dark:shadow-[0_8px_32px_rgb(0_0_0/0.4)]'
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
              Today&apos;s Question
            </span>
            <span
              aria-label={`Closes in ${closesClock}`}
              className='flex items-center gap-1 rounded-full border border-success/40 bg-dark px-2.5 py-1 text-xs font-bold text-lime tabular-nums dark:bg-[#000]/40'
            >
              <HugeiconsIcon icon={Clock01Icon} size={13} />
              {closesClock}
            </span>
          </div>

          <div className='mb-4 lg:mb-5'>
            <div className='animate-gradient-text bg-linear-135 from-dark via-success to-dark text-[26px] leading-[1.05] font-extrabold tracking-[-0.02em] uppercase sm:text-3xl lg:text-[40px] dark:from-lime dark:via-success dark:to-lime'>
              Predict &amp; Win Daily
            </div>
            <p className='mt-1 text-xs font-semibold text-muted lg:text-sm'>
              Win airtime, data and cash daily.
            </p>
          </div>

          <div className='mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 lg:mb-6 lg:px-4'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/20 text-dark dark:bg-lime/10 dark:text-lime'>
              <HugeiconsIcon icon={UserAdd01Icon} size={18} />
            </span>
            <div className='min-w-0 flex-1 text-xs leading-snug text-muted lg:text-sm'>
              <div>
                <strong className='font-bold text-success'>{WAITLIST_COUNT_LABEL}</strong>{' '}
                people have joined.
              </div>
            </div>
            <button
              type='button'
              onClick={scrollToOptions}
              className='btn-lift hidden h-9 shrink-0 items-center gap-1.5 rounded-lg bg-lime px-3.5 text-[11px] font-bold tracking-[0.05em] text-lime-ink uppercase shadow-[0_0_12px_rgb(191_250_0/0.3)] hover:bg-[#cfff3d] sm:flex'
            >
              <HugeiconsIcon icon={FlashIcon} size={14} />
              Predict Now
            </button>
          </div>

          <h2 className='mb-4 text-[17px] leading-snug font-semibold tracking-[-0.01em] text-foreground sm:text-lg lg:mb-6 lg:text-2xl'>
            {todayQuestion.text}
          </h2>

          <div id='market-options' className='mb-3.5 scroll-mt-28 lg:mb-6'>
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
                onAddNumber={addNumber}
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
                predictingAsLabel={predictingAsLabel}
                closesClock={closesClock}
                onViewEntry={() => setThankYouOpen(true)}
                onPredictAnother={handlePredictAnother}
              />
            )}
          </div>

          {/* mt-auto pins this row to the bottom when the card stretches on desktop. */}
          <div className='flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted lg:mt-auto lg:pt-4 lg:text-sm'>
            <span>
              <strong className='font-semibold text-foreground'>{predictionCount}</strong>{' '}
              {openDayStats ? 'predictions today' : 'predictions'}
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
                Next question by{' '}
                <strong className='font-semibold text-foreground'>{closesAtLabel}</strong>
              </span>
            )}
          </div>
        </>
      )}

      <ThankYouModal
        open={thankYouOpen}
        // Only a locked prediction is worth naming; otherwise it's the waitlist screen.
        pickedSide={stage === 'done' ? pickedSide : null}
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
