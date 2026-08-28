'use client'

import SectionHead from './SectionHead'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import type {
  PrizeKind,
  PrizePeriod,
  PrizePeriodRules,
  PrizeTierRule,
} from '../types/campaign'

const PERIOD_LABEL: Record<PrizePeriod, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  LAUNCH: 'Launch day',
}

const KIND_LABEL: Record<PrizeKind, string> = {
  CASH: 'cash',
  AIRTIME: 'airtime',
  BONUS_CREDIT: 'bonus credit',
}

function tierLine(tier: PrizeTierRule) {
  return `${formatMoney(tier.amount)} ${KIND_LABEL[tier.kind]}`
}

function PeriodCard({ period }: { period: PrizePeriodRules }) {
  const tiers = period.tiers.slice().sort((a, b) => a.place - b.place)
  return (
    <div className='flex flex-col w-full rounded-2xl border border-dashed border-border bg-plain p-6'>
      <div className='mb-4 text-xs font-bold tracking-[2px] text-success uppercase'>
        {PERIOD_LABEL[period.period]}
      </div>
      <div className='flex flex-1 flex-col gap-3.5'>
        {tiers.map((tier) => (
          <div
            key={tier.place}
            className='flex items-center justify-between gap-4 border-b border-border pb-3.5 last:border-b-0 last:pb-0'
          >
            <div>
              <div className='font-display text-sm font-bold text-black'>
                {tier.name}
              </div>
              <div className='mt-0.5 text-[12.5px] text-placeholder'>
                {tierLine(tier)}
              </div>
            </div>
            <div className='shrink-0 text-right text-xs font-semibold text-neutral-10'>
              {tier.winnerCount} winner{tier.winnerCount > 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PrizesSection() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const periods = rules?.prizes.filter((p) => p.period !== 'LAUNCH')

  return (
      <div id='prizes' className='flex flex-col items-center justify-center py-16 mx-auto px-6 max-w-250'>
        <SectionHead
          kicker='Prizes to be won'
          title='Win daily and weekly'
          subtitle='Every correct prediction stacks toward daily and weekly rewards — plus an entry into the launch-day grand prize.'
        />
        {!periods ? (
          <div className='py-6 text-center text-sm text-neutral-10'>
            Loading prize table…
          </div>
        ) : (
          <div className='flex md:flex-row flex-col gap-5 items-center justify-center w-full'>
            {periods.map((period) => (
              <PeriodCard key={period.period} period={period} />
            ))}
          </div>
        )}
      </div>
  )
}
