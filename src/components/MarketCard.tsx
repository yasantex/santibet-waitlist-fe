'use client'

import { useEffect, useState } from 'react'
import { todaysMarket } from '../utils/data'
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
import type { Money } from '../types/campaign'

const dayClock = '12:00:00'

function formatMoney(money: Money) {
  const prefix = money.currency === 'NGN' ? '₦' : `${money.currency} `
  return `${prefix}${Number(money.amount).toLocaleString()}`
}

type Stage = 'pick' | 'phone' | 'code' | 'done'

export default function MarketCard() {
  const dispatch = useAppDispatch()
  const standing = useAppSelector((s) => s.campaign.standing)

  const { activeCampaign } = useActiveCampaign()
  const slug = activeCampaign?.slug ?? null
  const { data: stats } = useCampaignStats(slug)
  const { data: todayQuestion, isError: todayQuestionError } =
    useTodayQuestion(slug)
  const { data: meData } = useMe(slug)
  const closes = useCountdown(todayQuestion?.closesAt)

  const isLive = Boolean(slug) && Boolean(todayQuestion) && !todayQuestionError
  const knownReturningPlayer = isLive && Boolean(standing)

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
  const [referralCode] = useState<string | undefined>(() =>
    typeof window === 'undefined'
      ? undefined
      : (new URLSearchParams(window.location.search).get('ref') ?? undefined),
  )

  // demo fallback fields — used only while no campaign is live yet
  const [demoFounderNumber, setDemoFounderNumber] = useState('')
  const [demoFounderRank, setDemoFounderRank] = useState('')
  const [demoReferLink, setDemoReferLink] = useState('')

  useEffect(() => {
    if (meData) dispatch(setStanding(meData))
  }, [meData, dispatch])

  const submitted = stage === 'done'
  const showPhoneStep = !knownReturningPlayer
  const canSubmit = knownReturningPlayer || phone.trim().length > 0

  const questionText = todayQuestion?.text ?? todaysMarket.question
  const yesPercent = stats?.today?.yesPercent ?? todaysMarket.yesPercent
  const noPercent =
    stats?.today?.yesPercent != null
      ? 100 - stats.today.yesPercent
      : todaysMarket.noPercent
  const alreadyPredicted = stats
    ? (stats.today?.predictions ?? stats.totalPredictions).toLocaleString()
    : todaysMarket.alreadyPredicted
  const prizePoolLabel = stats?.dailyPrizePool?.[0]
    ? formatMoney(stats.dailyPrizePool[0])
    : todaysMarket.prizePool
  const closesClock =
    isLive && closes
      ? `${closes.hours}:${closes.mins}:${closes.secs}`
      : dayClock

  function handlePick(side: PredictionSide) {
    setPickedSide(side)
    setErrorMsg(null)
  }

  async function handleLiveSubmit() {
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

  function handleDemoSubmit() {
    if (!phone.trim()) return
    const num = 18000 + Math.floor(Math.random() * 900)
    const rank = 2000 + Math.floor(Math.random() * 400)
    setDemoFounderNumber(`#${num.toLocaleString()}`)
    setDemoFounderRank(`#${rank.toLocaleString()}`)
    setDemoReferLink(`santibet.ng/r/${num}`)
    setStage('done')
  }

  async function handleResendCode() {
    setErrorMsg(null)
    try {
      const result = await resendMutation.mutateAsync({ phone: phone.trim() })
      setDestination(result.destination)
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Could not resend the code — try again shortly.'))
    }
  }

  function handlePrimarySubmit() {
    if (isLive) {
      handleLiveSubmit()
    } else {
      handleDemoSubmit()
    }
  }

  const referLink = isLive
    ? standing
      ? `${window.location.origin}/?ref=${standing.referralCode}`
      : ''
    : demoReferLink
  const founderNumber = isLive
    ? standing
      ? `#${standing.participantNumber.toLocaleString()}`
      : ''
    : demoFounderNumber
  const founderRank = isLive
    ? standing?.rank != null
      ? `#${standing.rank.toLocaleString()}`
      : '—'
    : demoFounderRank

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

  return (
    <div className='mx-auto max-w-140'>
      {/* Slip masthead */}
      <div className='flex items-center justify-between rounded-t-2xl bg-black px-6 py-3'>
        <span className=' text-xs font-semibold text-white '>
          SantiBet Slip
        </span>
        <span aria-hidden='true' className='barcode h-3 w-16 text-white' />
      </div>

      {/* Perforated seam + body */}
      <div className='relative'>
        <span className='absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white' />
        <span className='absolute -top-3 -right-3 h-6 w-6 rounded-full bg-white' />

        <div className='rounded-b-2xl border border-t-0 border-dashed border-border bg-plain'>
          {!submitted ? (
            <div className='px-7.5 pt-8.5 pb-6.5'>
              <div className='mb-3.5  text-sm font-semibold text-success '>
                Today&apos;s Market
              </div>
              <div className='mb-5.5 font-display text-[32px] leading-8 font-bold text-black'>
                {questionText}
              </div>

              <div className='mb-5 flex gap-3'>
                <button
                  type='button'
                  onClick={() => handlePick('yes')}
                  aria-pressed={pickedSide === 'yes'}
                  className={`relative flex-1 overflow-hidden rounded-lg px-3.5 py-4 text-lefty text-[19px] font-bold ${
                    pickedSide === 'yes'
                      ? 'bg-surface-success text-market-success'
                      : 'bg-white text-black'
                  }`}
                >
                  <div
                    className='absolute top-0 bottom-0 left-0 z-0 bg-success/[0.12]'
                    style={{ width: `${yesPercent}%` }}
                  />
                  <span className='relative z-10 block'>YES</span>
                  <span className='relative z-10 mt-1 block  text-[13px] text-neutral-10'>
                    {yesPercent}% of predictions
                  </span>
                </button>
                <button
                  type='button'
                  onClick={() => handlePick('no')}
                  aria-pressed={pickedSide === 'no'}
                  className={`relative flex-1 overflow-hidden rounded-lg px-3.5 py-4 text-left font-display text-[19px] font-bold tracking-wide ${
                    pickedSide === 'no'
                      ? 'bg-surface-error text-market-error'
                      : 'bg-white text-black'
                  }`}
                >
                  <div
                    className='absolute top-0 bottom-0 left-0 z-0 bg-error/[0.12]'
                    style={{ width: `${noPercent}%` }}
                  />
                  <span className='relative z-10 block'>NO</span>
                  <span className='relative z-10 mt-1 block  text-[13px] text-neutral-10'>
                    {noPercent}% of predictions
                  </span>
                </button>
              </div>

              <div className='grid grid-cols-3 gap-3 border-t border-dashed border-border pt-4.5'>
                <div className='text-center'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Closes in
                  </div>
                  <div className=' text-[15px] font-bold text-success'>
                    {closesClock}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Already predicted
                  </div>
                  <div className=' text-[15px] font-bold text-black'>
                    {alreadyPredicted}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Prize pool today
                  </div>
                  <div className=' text-[15px] font-bold text-black'>
                    {prizePoolLabel}
                  </div>
                </div>
              </div>

              {pickedSide && stage !== 'code' && (
                <div className='mt-5.5 border-t border-dashed border-border pt-5'>
                  <div className='mb-3 text-sm text-placeholder'>
                    Great choice — you predicted{' '}
                    <strong className='text-black'>
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
                        className='min-w-45 flex-1 rounded-lg border border-border bg-white px-4 py-3.25 text-[15px] text-black placeholder:text-placeholder'
                      />
                    )}
                    <button
                      type='button'
                      onClick={handlePrimarySubmit}
                      disabled={!canSubmit || submitting}
                      className={`rounded-lg px-6 py-3.25 font-bold transition-colors ${
                        canSubmit && !submitting
                          ? 'bg-brand-green text-black'
                          : 'cursor-not-allowed bg-border text-neutral-10'
                      }`}
                    >
                      {submitting ? 'Submitting…' : 'Confirm prediction'}
                    </button>
                  </div>
                  {showPhoneStep && (
                    <div className='mt-2.5 text-[12px] text-neutral-10'>
                      We only use this to save your daily prediction — no spam,
                      ever.
                    </div>
                  )}
                  {errorMsg && (
                    <div className='mt-2.5 text-[12.5px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}

              {stage === 'code' && (
                <div className='mt-5.5 border-t border-dashed border-border pt-5'>
                  <div className='mb-3 text-sm text-placeholder'>
                    We sent a 6-digit code to{' '}
                    <strong className='text-black'>{destination}</strong>.
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
                      className='min-w-45 flex-1 rounded-lg border border-border bg-white px-4 py-3.25 text-[15px] tracking-[4px] text-black placeholder:text-placeholder placeholder:tracking-normal'
                    />
                    <button
                      type='button'
                      onClick={handleConfirmCode}
                      disabled={code.trim().length !== 6 || submitting}
                      className={`rounded-lg px-6 py-3.25 font-bold transition-colors ${
                        code.trim().length === 6 && !submitting
                          ? 'bg-brand-green text-black'
                          : 'cursor-not-allowed bg-border text-neutral-10'
                      }`}
                    >
                      {submitting ? 'Verifying…' : 'Verify & submit'}
                    </button>
                  </div>
                  {errorMsg && (
                    <div className='mt-2.5 text-[12.5px] font-medium text-error'>
                      {errorMsg}
                    </div>
                  )}
                  <button
                    type='button'
                    onClick={handleResendCode}
                    disabled={resendMutation.isPending}
                    className='mt-2.5 text-[12px] font-medium text-neutral-10 underline underline-offset-2'
                  >
                    {resendMutation.isPending ? 'Resending…' : "Didn't get it? Resend code"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='px-7.5 pt-8.5 pb-7.5 text-center'>
              <div className='mb-4 inline-block -rotate-3 rounded-md border-2 border-market-success px-4 py-1.5  text-xs font-bold tracking-[3px] text-market-success uppercase'>
                Confirmed
              </div>
              <div className='mb-5.5 font-display text-[22px] font-bold text-black uppercase'>
                Prediction submitted
              </div>
              <div className='mb-5.5 grid grid-cols-2 gap-3.5 text-left'>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Founder Number
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    {founderNumber}
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Today&apos;s entry
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    Confirmed
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Current Founder rank
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    {founderRank}
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Your prediction
                  </div>
                  <div className=' text-[17px] font-bold text-success'>
                    {pickedSide?.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className='mb-4.5 text-[13.5px] text-placeholder'>
                Come back after midnight for today&apos;s result.
              </div>
              <div className='inline-flex items-center gap-2.5 rounded-full bg-white px-4.5 py-2.5  text-[13px] text-neutral-10'>
                Tomorrow&apos;s prediction unlocks in{' '}
                <b className='text-[15px] text-black'>{dayClock}</b>
              </div>

              <div className='mt-5.5 border-t border-dashed border-border pt-5 text-left'>
                <div className='mb-3 text-[13.5px] text-placeholder'>
                  Want to climb faster? Invite a friend — you both earn{' '}
                  <strong className='text-success'>+5 points</strong> when
                  they predict.
                </div>
                <div className='flex flex-wrap gap-2.5'>
                  <input
                    readOnly
                    value={referLink}
                    aria-label='Your referral link'
                    className='min-w-45 flex-1 rounded-lg border border-border bg-white px-3.5 py-3  text-sm text-placeholder'
                  />
                  <button
                    type='button'
                    onClick={handleCopy}
                    className='rounded-lg bg-brand-green px-6 py-3.25 font-bold text-black'
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
