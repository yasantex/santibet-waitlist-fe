'use client'

import { referSteps } from '../utils/data'
import SectionHead from './SectionHead'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import type { ReferralMilestone } from '../types/campaign'

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
          kicker='Refer A Friend'
          title={
            <>
              Climb faster
              <br />
              with backup.
            </>
          }
          subtitle='Every friend who joins and makes a prediction moves you both up the board.'
        />

        <div className='mx-auto mb-10 grid max-w-225 grid-cols-1 gap-5 sm:grid-cols-3'>
          {referSteps.map((step) => (
            <div key={step.num} className='rounded-2xl border border-border bg-surface px-5.5 py-6.5'>
              <div className='mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-lime text-[15px] font-black text-lime-ink'>
                {step.num}
              </div>
              <div className='mb-2 font-display text-lg font-black tracking-[0.3px] text-ink'>
                {step.what}
              </div>
              <div className='text-sm text-muted'>{step.sub}</div>
            </div>
          ))}
        </div>

        <div className='mx-auto max-w-140 overflow-hidden rounded-2xl bg-dark dark:border dark:border-border dark:bg-surface-2'>
          {!milestones ? (
            <div className='p-6 text-center text-lg text-white/70 dark:text-muted'>
              Loading referral rewards…
            </div>
          ) : milestones.length === 0 ? (
            <div className='p-6 text-center text-lg text-white/70 dark:text-muted'>
              No referral milestones published yet.
            </div>
          ) : (
            milestones.map((m) => (
              <div
                key={m.friendCount}
                className='flex md:flex-row flex-col items-start md:items-center justify-between gap-4 border-b border-white/10 px-5.5 py-4 text-[14.5px] last:border-b-0 dark:border-border'
              >
                <div className='shrink-0 font-display text-lg font-bold text-white dark:text-ink'>
                  {m.friendCount} friends
                </div>
                <div className='md:text-right text-left text-[15px] font-bold text-lime'>
                  {milestoneReward(m)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
