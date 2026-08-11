'use client'

import { useState } from 'react'
import { todaysMarket } from '../utils/data'
import { PredictionSide } from '../utils/types'

const dayClock = '12:00:00'

export default function MarketCard() {
  const [pickedSide, setPickedSide] = useState<PredictionSide | null>(null)
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [founderNumber, setFounderNumber] = useState('')
  const [founderRank, setFounderRank] = useState('')
  const [referLink, setReferLink] = useState('')
  const [copied, setCopied] = useState(false)

  function handlePick(side: PredictionSide) {
    setPickedSide(side)
  }

  function handleSubmit() {
    if (!phone.trim()) return
    const num = 18000 + Math.floor(Math.random() * 900)
    const rank = 2000 + Math.floor(Math.random() * 400)
    setFounderNumber(`#${num.toLocaleString()}`)
    setFounderRank(`#${rank.toLocaleString()}`)
    setReferLink(`santibet.ng/r/${num}`)
    setSubmitted(true)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referLink)
    } catch {
      // clipboard API unavailable — ignore, the input remains selectable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className='mx-auto max-w-140 overflow-hidden rounded-2xl border border-gold bg-navy-2 shadow-[0_0_60px_-12px_rgba(196,245,5,0.14),0_20px_60px_-20px_rgba(0,0,0,0.6)]'>
      {!submitted ? (
        <div className='px-7.5 pt-7.5 pb-6.5'>
          <div className='mb-3.5 font-mono text-[11px] tracking-[1.5px] text-gold-bright uppercase'>
            Today&apos;s Market
          </div>
          <div className='mb-5.5 font-display text-[26px] leading-[1.15] font-bold uppercase'>
            {todaysMarket.question}
          </div>

          <div className='mb-5 flex gap-3'>
            <button
              type='button'
              onClick={() => handlePick('yes')}
              className={`relative flex-1 overflow-hidden rounded-lg border px-3.5 py-4 text-left font-display text-[19px] font-bold tracking-wide transition-colors ${
                pickedSide === 'yes'
                  ? 'border-win text-win'
                  : 'border-line text-paper hover:border-win hover:text-win'
              } bg-navy-1`}
            >
              <div
                className='absolute top-0 bottom-0 left-0 z-0 bg-win/[0.14]'
                style={{ width: `${todaysMarket.yesPercent}%` }}
              />
              <span className='relative z-10 block'>YES</span>
              <span className='relative z-10 mt-1 block font-mono text-[13px] text-slate'>
                {todaysMarket.yesPercent}% of predictions
              </span>
            </button>
            <button
              type='button'
              onClick={() => handlePick('no')}
              className={`relative flex-1 overflow-hidden rounded-lg border px-3.5 py-4 text-left font-display text-[19px] font-bold tracking-wide transition-colors ${
                pickedSide === 'no'
                  ? 'border-lose text-lose'
                  : 'border-line text-paper hover:border-lose hover:text-lose'
              } bg-navy-1`}
            >
              <div
                className='absolute top-0 bottom-0 left-0 z-0 bg-lose/[0.14]'
                style={{ width: `${todaysMarket.noPercent}%` }}
              />
              <span className='relative z-10 block'>NO</span>
              <span className='relative z-10 mt-1 block font-mono text-[13px] text-slate'>
                {todaysMarket.noPercent}% of predictions
              </span>
            </button>
          </div>

          <div className='grid grid-cols-3 gap-3 border-t border-line pt-4.5'>
            <div className='text-center'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Closes in
              </div>
              <div className='font-mono text-[15px] font-bold text-gold-bright'>
                {dayClock}
              </div>
            </div>
            <div className='text-center'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Already predicted
              </div>
              <div className='font-mono text-[15px] font-bold text-paper'>
                {todaysMarket.alreadyPredicted}
              </div>
            </div>
            <div className='text-center'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Prize pool today
              </div>
              <div className='font-mono text-[15px] font-bold text-paper'>
                {todaysMarket.prizePool}
              </div>
            </div>
          </div>

          {pickedSide && (
            <div className='mt-5.5 border-t border-line pt-5'>
              <div className='mb-3 text-sm text-paper-dim'>
                Great choice — you predicted{' '}
                <strong className='text-paper'>
                  {pickedSide.toUpperCase()}
                </strong>
                . Enter your mobile number to lock it in.
              </div>
              <div className='flex flex-wrap gap-2.5'>
                <input
                  type='tel'
                  placeholder='Your mobile number'
                  aria-label='Mobile number'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='min-w-45 flex-1 rounded-lg border border-line bg-navy-1 px-4 py-3.25 text-[15px] text-paper placeholder:text-slate'
                />
                <button
                  type='button'
                  onClick={handleSubmit}
                  className='rounded-lg bg-gold px-6 py-3.25 font-bold text-navy-0 transition-[transform,box-shadow] hover:-translate-y-px hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(168,216,10,0.55)]'
                >
                  Confirm prediction
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='px-7.5 pt-8.5 pb-7.5 text-center'>
          <div className='mb-2.5 text-[34px]'>✅</div>
          <div className='mb-5.5 font-display text-[22px] font-bold uppercase'>
            Prediction submitted
          </div>
          <div className='mb-5.5 grid grid-cols-2 gap-3.5 text-left'>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Founder Number
              </div>
              <div className='font-mono text-[17px] font-bold text-gold-bright'>
                {founderNumber}
              </div>
            </div>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Today&apos;s entry
              </div>
              <div className='font-mono text-[17px] font-bold text-gold-bright'>
                Confirmed
              </div>
            </div>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Current Founder rank
              </div>
              <div className='font-mono text-[17px] font-bold text-gold-bright'>
                {founderRank}
              </div>
            </div>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Your prediction
              </div>
              <div className='font-mono text-[17px] font-bold text-gold-bright'>
                {pickedSide?.toUpperCase()}
              </div>
            </div>
          </div>
          <div className='mb-4.5 text-[13.5px] text-paper-dim'>
            Come back after midnight for today&apos;s result.
          </div>
          <div className='inline-flex items-center gap-2.5 rounded-full border border-line bg-navy-1 px-4.5 py-2.5 font-mono text-[13px] text-slate'>
            Tomorrow&apos;s prediction unlocks in{' '}
            <b className='text-[15px] text-paper'>{dayClock}</b>
          </div>

          <div className='mt-5.5 border-t border-dashed border-line pt-5 text-left'>
            <div className='mb-3 text-[13.5px] text-paper-dim'>
              Want to climb faster? Invite a friend — you both earn{' '}
              <strong className='text-gold-bright'>+5 points</strong> when they
              predict.
            </div>
            <div className='flex flex-wrap gap-2.5'>
              <input
                readOnly
                value={referLink}
                className='min-w-45 flex-1 rounded-lg border border-line bg-navy-1 px-3.5 py-3 font-mono text-sm text-paper-dim'
              />
              <button
                type='button'
                onClick={handleCopy}
                className='rounded-lg bg-gold px-6 py-3.25 font-bold text-navy-0 transition-[transform,box-shadow] hover:-translate-y-px hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(168,216,10,0.55)]'
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
