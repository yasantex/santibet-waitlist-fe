'use client'

import CountdownTimer from './CountdownTimer'
import { todaysMarket } from '../utils/data'
import { useActiveCampaign, useCampaignStats } from '../hooks/useCampaign'

export default function Hero() {
  const { activeCampaign } = useActiveCampaign()
  const { data: stats } = useCampaignStats(activeCampaign?.slug)

  const prizePool = stats?.dailyPrizePool?.[0]
  const prizePoolLabel = prizePool
    ? `${prizePool.currency === 'NGN' ? '₦' : prizePool.currency + ' '}${Number(
        prizePool.amount,
      ).toLocaleString()}`
    : todaysMarket.prizePool
  const predictedLabel = stats
    ? (stats.today?.predictions ?? stats.totalPredictions).toLocaleString()
    : todaysMarket.alreadyPredicted
  const yesPercentLabel =
    stats?.today?.yesPercent != null
      ? stats.today.yesPercent
      : todaysMarket.yesPercent

  return (
    <div className='mx-auto h-screen flex flex-col gap-5 items-center justify-center py-20 text-center'>
      <div className='font-medium rounded-full border border-dashed border-border  px-4 py-1.75 text-sm text-success'>
        <span className='animate-pulse-dot h-1.75 w-1.75 rounded-full  bg-success' />
        Pre-launch · Predictions live daily
      </div>

      <h1 className='mx-auto max-w-230 px-5 font-display text-[clamp(42px,8.5vw,84px)] leading-[0.94] font-extrabold tracking-[-0.01em] text-black'>
        Predict.{' '}
        <span className='relative inline-block px-1'>
          <span
            aria-hidden='true'
            className='absolute inset-x-0 bottom-[0.14em] h-[0.3em] -rotate-1 bg-brand-green'
          />
          <span className='relative'>Win.</span>
        </span>{' '}
        Repeat.
      </h1>

      <p className='max-w-125 text-base text-placeholder'>
        One question. One tap. Every correct call moves you closer to ₦1,000,000
        on launch day.
      </p>
      <div className='flex gap-2.5 items-center justify-center font-medium mx-auto rounded-full border border-dashed border-border px-5 py-2.5 text-sm w-fit text-neutral-10'>
        <span>{prizePoolLabel} Pool today</span>
        <span className='text-black'>·</span>
        <span>{predictedLabel} Predictions</span>
        <span className='text-black'>·</span>
        <span className='text-success'>{yesPercentLabel}% said Yes</span>
      </div>

      <CountdownTimer />

      <a
        href='#market'
        className='shrink-0 mt-5 rounded-full w-fit bg-brand-green px-4 py-2.5 text-xs font-semibold text-black '
      >
       Predict now
      </a>
    </div>
  )
}
