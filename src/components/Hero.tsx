'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  useActiveCampaign,
  useCampaignRules,
  useCampaignStats,
} from '../hooks/useCampaign'
import { formatMoney, trackEvent } from '../utils/constants'
import { focusQuestionCard } from '../utils/page'
import { primaryButtonClass } from './market-card/utils'
import { User02FreeIcons } from '@hugeicons/core-free-icons'

export default function Hero() {
  const { activeCampaign } = useActiveCampaign()
  const { data: stats } = useCampaignStats(activeCampaign?.slug)
  const { data: rules } = useCampaignRules(activeCampaign?.slug)

  const prizePool = stats?.dailyPrizePool?.[0]
  const launchHeadlineTier = rules?.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)[0]
  // Falls back to the static figure until /rules loads — not worth a layout shift.
  const grandPrizeLabel = launchHeadlineTier
    ? formatMoney(launchHeadlineTier.amount, { compact: true })
    : '₦1M'

  return (
    <div className='flex flex-col gap-4 text-center'>
      <button
        type='button'
        onClick={() => {
          focusQuestionCard()
          trackEvent({ event: 'cta_click', cta_name: 'hero_join_waitlist' })
        }}
        className={`${primaryButtonClass(true)} uppercase flex items-center gap-2.5`}
      >
        <HugeiconsIcon icon={User02FreeIcons} size={16} className='font-bold' />
        Join Waitlist
      </button>

      <div className='py-1'>
        <h1 className='animate-gradient-text mb-1 bg-linear-135 from-dark via-success to-dark text-[clamp(28px,7vw,40px)] leading-[1.1] font-extrabold tracking-[-0.02em] uppercase dark:from-lime dark:via-success dark:to-lime'>
          Predict &amp; Win Daily
        </h1>
        <p className='mb-1.5 text-base font-semibold tracking-[-0.01em] text-foreground sm:text-lg'>
          Make today&apos;s prediction.
        </p>
        <p className='mx-auto max-w-110 text-sm leading-relaxed text-muted'>
          Free daily Yes/No questions. No deposit, no payment.
          {prizePool &&
            ` Win ${formatMoney(prizePool)} airtime & data daily.`}{' '}
          Launch Grand Prize{' '}
          <span className='align-middle text-2xl leading-none font-extrabold tracking-[-0.02em] text-dark dark:text-lime'>
            {grandPrizeLabel}
          </span>
        </p>
      </div>
    </div>
  )
}
