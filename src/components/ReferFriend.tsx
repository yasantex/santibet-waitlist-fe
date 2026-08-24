'use client'

import { referMilestones as mockReferMilestones, referSteps } from '../utils/data'
import SectionHead from './SectionHead'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import type { Money, ReferralMilestone } from '../types/campaign'

function formatMoney(money: Money) {
  const prefix = money.currency === 'NGN' ? '₦' : `${money.currency} `
  return `${prefix}${Number(money.amount).toLocaleString()}`
}

function milestoneReward(m: ReferralMilestone) {
  const parts: string[] = []
  if (m.reward) {
    const kindLabel =
      m.rewardKind === 'CASH'
        ? 'cash'
        : m.rewardKind === 'AIRTIME'
          ? 'airtime'
          : 'bonus credit'
    parts.push(`${formatMoney(m.reward)} ${kindLabel}`)
  }
  if (m.bonusPoints) parts.push(`${m.bonusPoints} bonus points`)
  if (m.bonusDrawEntries)
    parts.push(`${m.bonusDrawEntries} extra draw entries`)
  return parts.join(' + ') || 'Bonus rewards'
}

export default function ReferFriend() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const milestones = rules?.referralMilestones
    .slice()
    .sort((a, b) => a.friendCount - b.friendCount)

  return (
    <section id='refer' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Refer a friend'
          title='Climb faster together'
          subtitle='Every friend who joins and makes their first prediction moves you both up the board.'
        />

        <div className='mx-auto mb-10 grid max-w-225 grid-cols-1 gap-5 sm:grid-cols-3'>
          {referSteps.map((step) => (
            <div key={step.num} className='rounded-xl bg-plain px-5.5 py-6.5'>
              <div className='mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-black  text-[12px] font-bold text-white'>
                {step.num}
              </div>
              <div className='mb-2 font-display text-xl tracking-[0.3px] text-black'>
                {step.what}
              </div>
              <div className='text-sm text-placeholder'>{step.sub}</div>
            </div>
          ))}
        </div>

        <div className='mx-auto max-w-140 overflow-hidden rounded-xl bg-plain'>
          {(milestones && milestones.length > 0
            ? milestones.map((m) => ({
                count: `${m.friendCount} friends`,
                reward: milestoneReward(m),
              }))
            : mockReferMilestones
          ).map((m) => (
            <div
              key={m.count}
              className='flex items-center justify-between gap-4 border-b border-border px-5.5 py-4 text-[14.5px] last:border-b-0'
            >
              <div className='shrink-0 font-display text-lg text-black'>
                {m.count}
              </div>
              <div className='text-right  text-[13px] text-success'>
                {m.reward}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
