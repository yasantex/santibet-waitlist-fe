'use client'

import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import { formatMoney } from '../utils/constants'

export default function Ticker() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const grandPrize = rules?.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)[0]

  const items = [
    'Predict Daily',
    'Earn Points',
    'Win Airtime',
    'Climb the Ranks',
    'Unlock Rewards',
    'Win Data',
    `${grandPrize ? formatMoney(grandPrize.amount, { compact: true }) : '₦1M'} Grand Prize`,
  ]

  return (
    <div
      aria-hidden='true'
      className='relative z-40 flex h-8 shrink-0 items-center overflow-hidden border-b border-lime-ink/10 bg-lime'
    >
      <div className='animate-ticker flex w-max whitespace-nowrap'>
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className='flex items-center gap-4 px-2 text-[11px] font-bold tracking-widest text-lime-ink uppercase'
          >
            {item}
            <span className='h-1 w-1 rounded-full bg-lime-ink/50' />
          </span>
        ))}
      </div>
    </div>
  )
}
