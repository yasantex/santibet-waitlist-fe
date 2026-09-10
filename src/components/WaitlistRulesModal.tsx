'use client'

import { useMemo } from 'react'
import Modal from './Modal'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import type { CampaignRules, Money, PrizePeriod, PrizeTierRule } from '../types/campaign'

type WaitlistRulesModalProps = {
  open: boolean
  onClose: () => void
}

type Section = {
  title: string
  items: string[]
}

// Static fallbacks — shown until /rules loads, so the modal never has to
// block opening on a fetch. Kept in sync with the numbers these describe:
// the highest daily/weekly payout, and the launch-day grand prize + date.
const FALLBACK_DAILY_WEEKLY = '₦5,000'
const FALLBACK_GRAND_PRIZE = '₦1,000,000'
const FALLBACK_LAUNCH_DATE = '1 November 2026'

function highestTierAcross(rules: CampaignRules, periods: PrizePeriod[]): Money | null {
  let best: PrizeTierRule | null = null
  for (const period of rules.prizes) {
    if (!periods.includes(period.period)) continue
    for (const tier of period.tiers) {
      if (!best || Number(tier.amount.amount) > Number(best.amount.amount)) best = tier
    }
  }
  return best?.amount ?? null
}

function launchHeadlineAmount(rules: CampaignRules): Money | null {
  const launchTiers = rules.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)
  return launchTiers?.[0]?.amount ?? null
}

function formatLaunchDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

function buildSections(dailyWeeklyLabel: string, grandPrizeLabel: string, launchDateLabel: string): Section[] {
  return [
    {
      title: 'How to Play',
      items: [
        'One Daily Prediction: Tap YES or NO on the daily gist before the timer runs out.',
        'Zero Deposit: No registration, no funding, and absolutely no payments required during pre-launch.',
        'Earn Points: Every correct prediction moves you up the Founder Leaderboard and stacks extra draw entries.',
      ],
    },
    {
      title: 'The Rewards',
      items: [
        `Daily & Weekly Payouts: Win up to ${dailyWeeklyLabel} in cash or airtime even before the official launch.`,
        `Launch Day Draw: Every active daily prediction serves as a ticket toward the ${grandPrizeLabel} Grand Prize on ${launchDateLabel}.`,
      ],
    },
    {
      title: 'Responsible Predicting',
      items: [
        'Just for Fun: Pre-launch predictions are 100% free and meant to test your crowd instincts.',
        'Fair Play: One account per person. Smart tracking is active to keep the leaderboard fair for all Founders.',
        'No Guarantees: Payout values follow strict tier limits. Live sports and market outcomes resolve conclusively based on official final data feeds.',
      ],
    },
  ]
}

export default function WaitlistRulesModal({
  open,
  onClose,
}: WaitlistRulesModalProps) {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)

  const sections = useMemo(() => {
    const dailyWeeklyLabel = rules
      ? (() => {
          const amount = highestTierAcross(rules, ['DAILY', 'WEEKLY'])
          return amount ? formatMoney(amount) : FALLBACK_DAILY_WEEKLY
        })()
      : FALLBACK_DAILY_WEEKLY

    const grandPrizeAmount = rules ? launchHeadlineAmount(rules) : null
    const grandPrizeLabel = grandPrizeAmount ? formatMoney(grandPrizeAmount) : FALLBACK_GRAND_PRIZE

    const launchDateLabel =
      formatLaunchDate(rules?.campaign.launchAt ?? activeCampaign?.launchAt) ?? FALLBACK_LAUNCH_DATE

    return buildSections(dailyWeeklyLabel, grandPrizeLabel, launchDateLabel)
  }, [rules, activeCampaign?.launchAt])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='SantiBet Waitlist & Prediction Rules'
      footer={
        <button
          type='button'
          onClick={onClose}
          className='w-full cursor-pointer rounded-xl bg-lime px-6 py-3.75 font-black text-lime-ink shadow-[0_5px_0_#8FC200] dark:text-[#10230a]!'
        >
          Got it, let&apos;s predict!
        </button>
      }
    >
      <div className='flex flex-col gap-5 text-sm leading-6 text-muted'>
        {sections.map((section) => (
          <section key={section.title}>
            <h4 className='mb-2 font-display text-base font-black text-ink'>
              {section.title}
            </h4>
            <ul className='list-disc space-y-1.5 pl-5'>
              {section.items.map((item) => {
                const [label, ...rest] = item.split(': ')
                const description = rest.join(': ')
                return (
                  <li key={label}>
                    <strong className='font-bold text-ink'>{label}:</strong>{' '}
                    {description}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  )
}
