'use client'

import { useEffect, useState } from 'react'
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
import {
  numberProven,
  numberVerified,
  setStanding,
  switchNumber,
} from '../redux/campaignSlice'
import { errorInfo, trackEvent } from '../utils/constants'
import type { PredictionParticipant } from '../types/campaign'
import WaitlistRulesModal from './WaitlistRulesModal'
import StepProgress from './market-card/StepProgress'
import PickStep from './market-card/PickStep'
import PhoneStep from './market-card/PhoneStep'
import CodeStep from './market-card/CodeStep'
import DoneStep from './market-card/DoneStep'
import {
  CODE_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  formatPhoneDisplay,
  maskPhone,
  type Stage,
} from './market-card/utils'

export default function MarketCard() {
  const dispatch = useAppDispatch()
  const cachedStanding = useAppSelector((s) => s.campaign.standing)
  const savedNumbers = useAppSelector((s) => s.campaign.numbers)
  const currentPhone = useAppSelector((s) => s.campaign.currentPhone)

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
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('pick')
  const [destination, setDestination] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailSent, setEmailSent] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [placedUnproven, setPlacedUnproven] = useState(false)
  /** Who the last prediction was placed for, as the predict response reports it. */
  const [placedParticipant, setPlacedParticipant] =
    useState<PredictionParticipant | null>(null)
  const [referralCode] = useState<string | undefined>(() =>
    typeof window === 'undefined'
      ? undefined
      : (new URLSearchParams(window.location.search).get('ref') ?? undefined),
  )

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
      setErrorMsg(
        getApiErrorMessage(err, 'Something went wrong. Please try again.'),
      )
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
          ) : !slug || todayQuestionError || !todayQuestion ? (
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
                <PickStep
                  question={todayQuestion.text}
                  stats={stats}
                  closesClock={closesClock}
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
                  founder={doneFounder}
                  closesClock={closesClock}
                  onPredictAnother={handlePredictAnother}
                />
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
