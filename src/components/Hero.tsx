'use client'

import { useState } from 'react'
import CountdownTimer from './CountdownTimer'
import { Icon } from './icons'
import { useActiveCampaign, useCampaignStats } from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import { useAppSelector } from '../redux/hooks'

export default function Hero() {
  const { activeCampaign } = useActiveCampaign()
  const { data: stats } = useCampaignStats(activeCampaign?.slug)
  const standing = useAppSelector((s) => s.campaign.standing)
  const [copied, setCopied] = useState(false)

  const prizePool = stats?.dailyPrizePool?.[0]
  const prizePoolLabel = prizePool ? formatMoney(prizePool) : '—'
  const predictedLabel = (
    stats?.today?.predictions ??
    stats?.totalPredictions ??
    0
  ).toLocaleString()
  const yesPercent = stats?.today?.yesPercent

  const referLink =
    standing && typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${standing.referralCode}`
      : ''

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referLink)
    } catch {
      // clipboard API unavailable — ignore, the input remains selectable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const tickerItems = [
    'Predict Daily',
    'Win Naira',
    'Win Data',
    'Zero Deposit',
    'Win Points',
    'Win Airtime',
    'Launching Soon',
    'Win Cash',
  ]

  return (
    <>
      <div className='mx-auto max-w-270 px-3 py-16 sm:px-6 sm:py-20'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-12 lg:gap-16'>
          {/* Left column */}
          <div className='flex flex-col items-center gap-5 text-center md:items-start md:text-left'>
            <div className='inline-flex items-center gap-2 font-bold uppercase tracking-[0.06em] rounded-full border-[1.5px] border-dark px-4 py-1.75 text-xs text-dark dark:border-lime dark:text-lime'>
              <span className='animate-pulse-dot h-1.75 w-1.75 rounded-full bg-success' />
              Pre-launch · New Call Drops Daily
            </div>

            <h1 className='max-w-230 px-5 font-display italic text-[clamp(30px,8.5vw,59px)] leading-[0.94] font-black tracking-[-0.02em] text-ink uppercase md:px-0'>
              Join the <br className='md:block hidden' /> pre-launch{' '}
              <span className='text-dark dark:text-lime'>waitlist.</span>
            </h1>

            <div className='-rotate-2 mt-1'>
              <span className='inline-block rounded-md bg-lime px-6 py-2.5 font-display italic text-lg sm:text-xl font-black tracking-[-0.01em] text-lime-ink shadow-[4px_4px_0_var(--color-dark)] dark:shadow-[4px_4px_0_var(--color-surface-2)]'>
                Predict. Win. Repeat.
              </span>
            </div>

            <p className='max-w-125 px-2 text-base text-muted font-medium md:px-0'>
              One gist. One tap. Every correct call pulls you closer to{' '}
              <strong className='text-ink font-bold'>₦1,000,000</strong> on
              launch day. No deposit, no wahala, no small print.
            </p>
            <div className='flex gap-2.5 items-center justify-center font-semibold rounded-full border border-border bg-surface px-5 py-2.5 text-sm w-fit text-ink md:justify-start'>
              <span>{prizePoolLabel} Pool today</span>
              <span className='text-border'>·</span>
              <span>{predictedLabel} Calls Made</span>
              {yesPercent != null && (
                <>
                  <span className='text-border'>·</span>
                  <span className='text-success font-extrabold'>
                    {yesPercent}% said Yes
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className='flex flex-col items-center gap-3.5 md:items-stretch md:pt-1'>
            <CountdownTimer />

            <div className='flex flex-col gap-2.5 items-center w-full max-w-100 md:max-w-none'>
              <a
                href='#market'
                className='shrink-0 w-full text-center rounded-2xl bg-lime px-8 py-4.5 text-lg font-black text-lime-ink sm:px-10 sm:text-xl shadow-[0_6px_0_#8FC200] dark:text-[#10230a]!'
              >
                Predict now →
              </a>
              <a
                href='#market'
                className='text-sm font-bold text-dark underline underline-offset-4 dark:text-lime'
              >
                Join the waitlist — takes 10 seconds
              </a>
            </div>

            {standing ? (
              <div className='relative w-full max-w-110 md:max-w-none rounded-2xl border-[1.5px] border-dark bg-surface px-5 pt-5 pb-4 text-left dark:border-lime'>
                <span className='absolute -top-3 left-4 rounded-full bg-lime px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.05em] text-lime-ink'>
                  Founder Rewards
                </span>
                <div className='flex items-center gap-3.5 mb-3.5'>
                  <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-xl bg-dark dark:bg-lime'>
                    <Icon
                      name='crown'
                      className='h-6.5 w-6.5 text-lime dark:text-lime-ink'
                    />
                  </div>
                  <div>
                    <div className='text-sm font-black text-ink'>
                      You&apos;re Founder #
                      {standing.participantNumber.toLocaleString()}
                    </div>
                    <div className='mt-0.5 text-xs font-medium text-muted'>
                      {standing.rank != null
                        ? `Currently ranked #${standing.rank.toLocaleString()}`
                        : 'Predict daily to climb the board'}
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <input
                    readOnly
                    value={referLink}
                    aria-label='Your referral link'
                    className='min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2.5 text-xs text-placeholder'
                  />
                  <button
                    type='button'
                    onClick={handleCopy}
                    className='shrink-0 rounded-lg bg-lime px-4 py-2.5 text-xs font-black text-lime-ink cursor-pointer'
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className='relative flex items-center gap-3.5 w-full max-w-110 md:max-w-none rounded-2xl border-[1.5px] border-dark bg-surface px-5 pt-5 pb-4 text-left dark:border-lime'>
                <span className='absolute -top-3 left-4 rounded-full bg-lime px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.05em] text-lime-ink'>
                  Founder Rewards
                </span>
                <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-xl bg-dark dark:bg-lime'>
                  <Icon
                    name='crown'
                    className='h-6.5 w-6.5 text-lime dark:text-lime-ink'
                  />
                </div>
                <div>
                  <div className='text-sm font-black text-ink'>
                    Predict early. Rank Legendary.
                  </div>
                  <div className='mt-0.5 text-xs font-medium text-muted leading-relaxed'>
                    Founder Badge, priority access and bonus credits — gone the
                    moment we launch.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='w-full overflow-hidden bg-lime py-3.5'>
        <div className='flex w-max animate-ticker gap-7 whitespace-nowrap text-xs font-black uppercase tracking-[0.03em] text-lime-ink'>
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map(
            (item, i) => (
              <span key={i} className="after:content-['•'] after:ml-7">
                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </>
  )
}
