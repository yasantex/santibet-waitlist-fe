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
  useSendVerification,
  useTodayQuestion,
} from '../hooks/useCampaign'
import { useCountdown } from '../hooks/useCountdown'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setStanding } from '../redux/campaignSlice'
import { formatMoney } from '../utils/money'

type Stage = 'pick' | 'phone' | 'code' | 'done'

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

  const submitted = stage === 'done'
  const showPhoneStep = !knownReturningPlayer
  const canSubmit = knownReturningPlayer || phone.trim().length > 0

  const yesPercent = stats?.today?.yesPercent
  const noPercent =
    yesPercent != null ? 100 - yesPercent : undefined
  const yesPercentLabel = yesPercent != null ? `${yesPercent}%` : 'No predictions yet'
  const noPercentLabel = noPercent != null ? `${noPercent}%` : 'No predictions yet'
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
      setErrorMsg(getApiErrorMessage(err, 'Something went wrong. Please try again.'))
    }
  }

  async function handleConfirmCode() {
    if (code.trim().length !== 6) return
    setErrorMsg(null)
    try {
      const result = await confirmMutation.mutateAsync({
        phone: phone.trim(),
        code: code.trim(),
      })
      dispatch(setStanding(result))
      setStage('done')
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'That code is invalid or has expired.'))
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
      setErrorMsg(getApiErrorMessage(err, 'Could not resend the code — try again shortly.'))
    }
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
          ) : !submitted ? (
            <div className='px-7.5 pt-8.5 pb-6.5'>
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
                  className={`relative flex-1 overflow-hidden rounded-xl px-3.5 py-4 text-left text-[19px] font-black transition-colors ${
                    pickedSide === 'yes'
                      ? 'border-2 border-dark bg-lime text-lime-ink dark:border-lime-ink'
                      : 'border-2 border-border bg-surface text-ink'
                  }`}
                >
                  <span className='relative z-10 block'>YES</span>
                  <span className='relative z-10 mt-1 block text-[13px] font-semibold text-muted'>
                    {yesPercentLabel}
                    {yesPercent != null && ' of predictions'}
                  </span>
                </button>
                <button
                  type='button'
                  onClick={() => handlePick('no')}
                  aria-pressed={pickedSide === 'no'}
                  className={`relative flex-1 overflow-hidden rounded-xl px-3.5 py-4 text-left font-display text-[19px] font-black tracking-wide transition-colors ${
                    pickedSide === 'no'
                      ? 'border-2 border-dark bg-lime text-lime-ink dark:border-lime-ink'
                      : 'border-2 border-border bg-surface text-ink'
                  }`}
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

              {pickedSide && stage !== 'code' && (
                <div className='mt-5.5 border-t border-dashed border-border pt-5'>
                  <div className='mb-3 text-lg text-placeholder'>
                    Great choice — you predicted{' '}
                    <strong className='text-ink'>
                      {pickedSide.toUpperCase()}
                    </strong>
                    .{' '}
                    {showPhoneStep
                      ? 'Enter your mobile number to lock it in.'
                      : 'Tap confirm to lock it in.'}
                  </div>
                  <div className='flex flex-wrap gap-2.5'>
                    {showPhoneStep && (
                      <input
                        type='tel'
                        placeholder='Your mobile number'
                        aria-label='Mobile number'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className='min-w-45 flex-1 rounded-lg border border-border bg-paper px-4 py-3.25 text-[15px] text-ink placeholder:text-placeholder'
                      />
                    )}
                    <button
                      type='button'
                      onClick={handleSubmit}
                      disabled={!canSubmit || submitting}
                      className={`rounded-lg px-6 py-3.25 cursor-pointer font-bold transition-colors ${
                        canSubmit && !submitting
                          ? 'bg-lime text-lime-ink'
                          : 'cursor-not-allowed bg-border text-neutral-10'
                      }`}
                    >
                      {submitting ? 'Submitting…' : 'Confirm prediction'}
                    </button>
                  </div>
                  {showPhoneStep && (
                    <div className='mt-2.5 text-[16px] text-neutral-10'>
                      We only use this to save your daily prediction — no spam,
                      ever.
                    </div>
                  )}
                  {errorMsg && (
                    <div className='mt-2.5 text-[16.5px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}

              {stage === 'code' && (
                <div className='mt-5.5 border-t border-dashed border-border pt-5'>
                  <div className='mb-3 text-lg text-placeholder'>
                    We sent a 6-digit code to{' '}
                    <strong className='text-ink'>{destination}</strong>.
                    Enter it to confirm your prediction.
                  </div>
                  <div className='flex flex-wrap gap-2.5'>
                    <input
                      type='text'
                      inputMode='numeric'
                      maxLength={6}
                      placeholder='6-digit code'
                      aria-label='Verification code'
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ''))
                      }
                      className='min-w-45 flex-1 rounded-lg border border-border bg-paper px-4 py-3.25 text-[15px] tracking-[4px] text-ink placeholder:text-placeholder placeholder:tracking-normal'
                    />
                    <button
                      type='button'
                      onClick={handleConfirmCode}
                      disabled={code.trim().length !== 6 || submitting}
                      className={`rounded-lg px-6 py-3.25 font-bold transition-colors cursor-pointer ${
                        code.trim().length === 6 && !submitting
                          ? 'bg-lime text-lime-ink'
                          : 'cursor-not-allowed bg-border text-neutral-10'
                      }`}
                    >
                      {submitting ? 'Verifying…' : 'Verify & submit'}
                    </button>
                  </div>
                  {errorMsg && (
                    <div className='mt-2.5 text-[16.5px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}
                  <button
                    type='button'
                    onClick={handleResendCode}
                    disabled={resendMutation.isPending || resendCooldown > 0}
                    className={`mt-2.5 text-[18px] font-bold underline underline-offset-2 ${
                      resendMutation.isPending || resendCooldown > 0
                        ? 'cursor-not-allowed text-neutral-10'
                        : 'cursor-pointer text-neutral-10'
                    }`}
                  >
                    {resendMutation.isPending
                      ? 'Resending…'
                      : resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Didn't get it? Resend code"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='px-7.5 pt-8.5 pb-7.5 text-center'>
              <div className='mb-4 inline-block -rotate-3 rounded-md border-2 border-market-success px-4 py-1.5  text-base font-bold tracking-[3px] text-market-success uppercase'>
                Confirmed
              </div>
              <div className='mb-5.5 font-display text-[22px] font-black text-ink uppercase'>
                Prediction submitted
              </div>
              <div className='mb-5.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left'>
                <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
                  <div className='mb-1  text-[14px] tracking-wide text-neutral-10 uppercase'>
                    Founder Number
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    {founderNumber}
                  </div>
                </div>
                <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
                  <div className='mb-1  text-[14px] tracking-wide text-neutral-10 uppercase'>
                    Today&apos;s entry
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    Confirmed
                  </div>
                </div>
                <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
                  <div className='mb-1  text-[14px] tracking-wide text-neutral-10 uppercase'>
                    Current Founder rank
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    {founderRank}
                  </div>
                </div>
                <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
                  <div className='mb-1  text-[14px] tracking-wide text-neutral-10 uppercase'>
                    Your prediction
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    {pickedSide?.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className='mb-4.5 text-[17.5px] text-placeholder'>
                Come back after midnight for today&apos;s result.
              </div>
              <div className='inline-flex items-center gap-2.5 rounded-full border border-border bg-paper px-4.5 py-2.5 text-sm md:text-[17px] text-neutral-10'>
                Today&apos;s window closes in{' '}
                <b className='text-[15px] text-ink'>{closesClock}</b>
              </div>

              <div className='mt-5.5 border-t border-dashed border-border pt-5 text-left'>
                <div className='mb-3 text-[17.5px] text-placeholder'>
                  Want to climb faster? Invite a friend — you both earn{' '}
                  <strong className='text-success'>+5 points</strong> when
                  they predict.
                </div>
                <div className='flex flex-wrap gap-2.5'>
                  <input
                    readOnly
                    value={referLink}
                    aria-label='Your referral link'
                    className='min-w-45 flex-1 rounded-lg border border-border bg-paper px-3.5 py-3  text-lg text-placeholder'
                  />
                  <button
                    type='button'
                    onClick={handleCopy}
                    className='rounded-lg cursor-pointer bg-lime px-6 py-3.25 font-bold text-lime-ink'
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                <div className='mt-2.5 text-[16px] font-semibold text-success'>
                  Refer as many friends as possible — every one of them moves
                  you up the board!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
