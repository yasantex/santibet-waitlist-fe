'use client'

import { useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CrownIcon,
  Dollar01Icon,
} from '@hugeicons/core-free-icons'
import {
  useActiveCampaign,
  useCampaignActivity,
  useCampaignRules,
} from '../../hooks/useCampaign'
import { formatMoney } from '../../utils/constants'
import type {
  Money,
  PrizeKind,
  PrizePeriod,
  PrizePeriodRules,
} from '../../types/campaign'
import SectionTitle, { PanelMessage } from './SectionTitle'

const PERIOD_ORDER: PrizePeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'LAUNCH']

const PERIOD_META: Record<PrizePeriod, { title: string; icon: IconSvgElement }> = {
  DAILY: { title: 'Today', icon: Clock01Icon },
  WEEKLY: { title: 'Weekly', icon: Calendar03Icon },
  MONTHLY: { title: 'Monthly', icon: Calendar03Icon },
  LAUNCH: { title: 'Launch Grand', icon: CrownIcon },
}

const KIND_LABEL: Record<PrizeKind, string> = {
  CASH: 'Cash',
  AIRTIME: 'Airtime',
  BONUS_CREDIT: 'Bonus credit',
}

function periodSubtitle(period: PrizePeriodRules, launchAt: string | null | undefined) {
  const kinds = [...new Set(period.tiers.map((t) => KIND_LABEL[t.kind]))].join(' & ')
  if (period.period === 'LAUNCH' && launchAt) {
    const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
      new Date(launchAt),
    )
    return `${kinds} · ${date}`
  }
  return kinds
}

/** The launch headline is its top tier; every other period shows its whole pool. */
function periodAmount(period: PrizePeriodRules): Money | null {
  const tiers = period.tiers.slice().sort((a, b) => a.place - b.place)
  if (tiers.length === 0) return null
  if (period.period === 'LAUNCH') return tiers[0].amount
  const total = tiers.reduce(
    (sum, t) => sum + Number(t.amount.amount) * t.winnerCount,
    0,
  )
  return { amount: String(total), currency: tiers[0].amount.currency }
}

function PeriodAccordion({
  period,
  open,
  onToggle,
  launchAt,
}: {
  period: PrizePeriodRules
  open: boolean
  onToggle: () => void
  launchAt: string | null | undefined
}) {
  const meta = PERIOD_META[period.period]
  const amount = periodAmount(period)
  const launch = period.period === 'LAUNCH'
  const tiers = period.tiers.slice().sort((a, b) => a.place - b.place)

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-surface-2'>
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={open}
        className='flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#000]/3 dark:hover:bg-white/3'
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            launch ? 'bg-lime text-lime-ink' : 'bg-lime/25 text-dark dark:bg-lime/15 dark:text-lime'
          }`}
        >
          <HugeiconsIcon icon={meta.icon} size={16} />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[13px] font-bold text-foreground'>{meta.title}</span>
          <span className='block truncate text-[11px] text-muted'>
            {periodSubtitle(period, launchAt)}
          </span>
        </span>
        {amount && (
          <span
            className={`shrink-0 font-extrabold text-dark dark:text-lime ${launch ? 'text-lg' : 'text-[15px]'}`}
          >
            {formatMoney(amount, { compact: launch })}
          </span>
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='bg-[#000]/3 px-3 py-1.5 dark:bg-[#000]/20'>
            {tiers.map((tier) => (
              <div
                key={tier.place}
                className='flex items-center justify-between gap-3 border-b border-dashed border-border py-2 last:border-b-0'
              >
                <div className='min-w-0'>
                  <div className='text-xs font-semibold text-foreground'>{tier.name}</div>
                  <div className='text-[11px] text-muted'>
                    {tier.winnerCount} winner{tier.winnerCount === 1 ? '' : 's'} ·{' '}
                    {KIND_LABEL[tier.kind].toLowerCase()}
                    {tier.maxPayout && ` · max ${formatMoney(tier.maxPayout)}`}
                  </div>
                </div>
                <div className='shrink-0 text-[13px] font-bold text-success'>
                  {formatMoney(tier.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrizesPanel() {
  const { activeCampaign } = useActiveCampaign()
  const slug = activeCampaign?.slug
  const { data: rules } = useCampaignRules(slug)
  const { data: activity } = useCampaignActivity(slug, 20)
  const [openPeriod, setOpenPeriod] = useState<PrizePeriod | null>('DAILY')

  const periods = rules?.prizes
    .filter((p) => p.tiers.length > 0)
    .sort((a, b) => PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period))
  const winners = (activity?.data ?? [])
    .filter((item) => item.type === 'WON')
    .slice(0, 5)

  return (
    <div>
      <SectionTitle icon={Dollar01Icon}>Prize Pools</SectionTitle>
      {!periods ? (
        <PanelMessage>Loading prize table…</PanelMessage>
      ) : (
        <div className='flex flex-col gap-2'>
          {periods.map((period) => (
            <PeriodAccordion
              key={period.period}
              period={period}
              launchAt={rules?.campaign.launchAt}
              open={openPeriod === period.period}
              onToggle={() =>
                setOpenPeriod((current) => (current === period.period ? null : period.period))
              }
            />
          ))}
        </div>
      )}

      {winners.length > 0 && (
        <>
          <SectionTitle icon={CheckmarkCircle02Icon} className='mt-5'>
            Recent Winners
          </SectionTitle>
          {winners.map(
            (item) =>
              item.type === 'WON' && (
                <div
                  key={`${item.player}|${item.at}`}
                  className='flex items-center justify-between gap-3 border-b border-border py-2 text-xs last:border-b-0'
                >
                  <span className='min-w-0 truncate font-medium text-foreground tabular-nums'>
                    {item.player}
                  </span>
                  <span className='shrink-0 font-bold text-success'>
                    {formatMoney(item.amount)}
                  </span>
                </div>
              ),
          )}
        </>
      )}
    </div>
  )
}
