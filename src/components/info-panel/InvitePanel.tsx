'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { FlashIcon, Link01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import {
  useActiveCampaign,
  useCampaignRules,
  useStanding,
} from '../../hooks/useCampaign'
import { formatMoney, trackEvent } from '../../utils/constants'
import { focusQuestionCard } from '../../utils/page'
import type { ReferralMilestone } from '../../types/campaign'
import ShareReferral from '../market-card/ShareReferral'
import { primaryButtonClass } from '../market-card/utils'
import { usePanel } from '../PanelContext'
import SectionTitle from './SectionTitle'

function milestoneReward(m: ReferralMilestone) {
  const parts: string[] = []
  if (m.reward) {
    const kindLabel =
      m.rewardKind === 'CASH' ? 'cash' : m.rewardKind === 'AIRTIME' ? 'airtime' : 'bonus credit'
    parts.push(`${formatMoney(m.reward)} ${kindLabel}`)
  }
  if (m.bonusPoints) parts.push(`${m.bonusPoints} bonus points`)
  if (m.bonusDrawEntries)
    parts.push(
      `${m.bonusDrawEntries} extra draw ${m.bonusDrawEntries === 1 ? 'entry' : 'entries'}`,
    )
  return parts.join(' + ') || 'Bonus rewards'
}

export default function InvitePanel() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const standing = useStanding(activeCampaign?.slug)
  const { closeMenu } = usePanel()
  const milestones = rules?.referralMilestones
    .slice()
    .sort((a, b) => a.friendCount - b.friendCount)
  const next = standing?.referrals.nextMilestone
  const nextMilestone = next
    ? milestones?.find((m) => m.friendCount === next.friendCount)
    : undefined
  const pointsPerReferral = rules?.scoring.pointsPerReferral ?? 0

  return (
    <div>
      <SectionTitle icon={Link01Icon}>Your Referral Link</SectionTitle>
      {standing ? (
        <>
          <ShareReferral referralCode={standing.referralCode} source='menu' />

          <div className='mt-3 flex items-center justify-between border-b border-border pb-3'>
            <div>
              <div className='text-xs text-muted'>Friends Joined</div>
              {pointsPerReferral > 0 && (
                <div className='text-[11px] text-muted'>
                  +{(standing.referrals.friends * pointsPerReferral).toLocaleString()} points
                  earned
                </div>
              )}
            </div>
            <div className='text-2xl font-extrabold text-success'>
              {standing.referrals.friends}
            </div>
          </div>

          {next && (
            <div className='relative mt-3 overflow-hidden rounded-xl border border-success bg-success/10 p-3'>
              <div className='mb-1 flex items-center gap-1 text-[10px] font-bold tracking-widest text-success uppercase'>
                <HugeiconsIcon icon={FlashIcon} size={12} />
                Next Milestone
              </div>
              <div className='text-[13px] leading-relaxed font-medium text-foreground'>
                Invite {next.friendsToGo} more friend{next.friendsToGo === 1 ? '' : 's'}
                {nextMilestone ? (
                  <>
                    {' '}to unlock{' '}
                    <strong className='text-dark dark:text-lime'>
                      {milestoneReward(nextMilestone)}
                    </strong>
                    .
                  </>
                ) : (
                  ' to unlock your next referral reward.'
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className='rounded-xl border border-dashed border-border bg-surface-2 p-3.5 text-center'>
          <p className='mb-3 text-[13px] text-muted'>
            Your unique link is created when you make your first prediction.
          </p>
          <button
            type='button'
            onClick={() => {
              closeMenu()
              focusQuestionCard()
              trackEvent({ event: 'cta_click', cta_name: 'invite_predict_now' })
            }}
            className={primaryButtonClass(true)}
          >
            Make Today&apos;s Prediction
          </button>
        </div>
      )}

      {milestones && milestones.length > 0 && (
        <>
          <SectionTitle icon={UserGroupIcon} className='mt-5'>
            Referral Rewards
          </SectionTitle>
          {milestones.map((m) => (
            <div
              key={m.friendCount}
              className='flex items-center justify-between gap-3 border-b border-border py-2 text-xs last:border-b-0'
            >
              <span className='shrink-0 font-semibold text-foreground'>
                {m.friendCount} friend{m.friendCount === 1 ? '' : 's'}
              </span>
              <span className='text-right font-semibold text-success'>{milestoneReward(m)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
