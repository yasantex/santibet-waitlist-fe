'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ChampionIcon, Share08Icon, StarIcon } from '@hugeicons/core-free-icons'
import {
  useActiveCampaign,
  useCampaignRules,
  useStanding,
} from '../hooks/useCampaign'
import { trackEvent } from '../utils/constants'
import { levelName, levelProgress, sortLevels } from '../utils/levels'
import ShareReferral from './market-card/ShareReferral'
import { usePanel } from './PanelContext'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-border bg-[#000]/4 px-3 py-2 dark:bg-[#000]/25'>
      <div className='text-[10px] font-semibold tracking-[0.06em] text-muted uppercase'>
        {label}
      </div>
      <div className='text-xl font-extrabold tracking-[-0.02em] text-dark tabular-nums dark:text-lime'>
        {value}
      </div>
    </div>
  )
}

/** The returning player's standing: Founder number, tier, rank, points and referral link. */
export default function PlayerCard() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const standing = useStanding(activeCampaign?.slug)
  const { showPanel } = usePanel()

  if (!standing) return null

  const levels = sortLevels(rules?.levels)
  const { current, next, percent } = levelProgress(levels, standing.points)
  const tier = current?.name ?? levelName(levels, standing.level)

  return (
    <>
      <div className='relative overflow-hidden rounded-[20px] border border-lime/40 bg-surface p-4 shadow-[0_8px_32px_rgb(0_0_0/0.08),0_0_24px_rgb(191_250_0/0.08)] sm:p-5 dark:shadow-[0_8px_32px_rgb(0_0_0/0.4),0_0_24px_rgb(191_250_0/0.06)]'>
        <span
          aria-hidden='true'
          className='absolute inset-x-0 top-0 h-px bg-linear-90 from-transparent via-lime to-transparent'
        />
        <div className='mb-3 flex items-start justify-between gap-3'>
          <div>
            <div className='text-[11px] font-bold tracking-widest text-dark uppercase dark:text-lime'>
              Your Player Card
            </div>
            <div className='text-xs font-medium text-muted tabular-nums'>
              Founder #{standing.participantNumber.toLocaleString()}
            </div>
          </div>
          {tier && (
            <span className='flex items-center gap-1 rounded-full border border-dark/20 bg-lime/25 px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-dark uppercase dark:border-lime/30 dark:bg-lime/10 dark:text-lime'>
              <HugeiconsIcon icon={StarIcon} size={11} />
              {tier}
            </span>
          )}
        </div>

        <div className='mb-3 grid grid-cols-2 gap-2'>
          <Stat
            label='Rank'
            value={standing.rank != null ? `#${standing.rank.toLocaleString()}` : '—'}
          />
          <Stat label='Points' value={standing.points.toLocaleString()} />
        </div>

        {levels.length > 0 && (
          <div className='mb-3'>
            <div className='mb-1.5 flex justify-between text-[11px] font-medium text-muted'>
              <span>{next ? `Progress to ${next.name}` : 'Top tier reached'}</span>
              {next && (
                <span className='tabular-nums'>
                  {standing.points} / {next.minPoints}
                </span>
              )}
            </div>
            <div
              role='progressbar'
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percent)}
              aria-label={next ? `Progress to ${next.name}` : 'Top tier reached'}
              className='h-1.5 overflow-hidden rounded-full border border-border bg-[#000]/5 dark:bg-[#000]/40'
            >
              <div
                className='h-full rounded-full bg-linear-90 from-success to-lime shadow-[0_0_8px_rgb(191_250_0/0.5)] transition-[width] duration-700'
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        <div className='border-t border-border pt-3'>
          <div className='mb-2 flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em] text-muted uppercase'>
            <HugeiconsIcon icon={Share08Icon} size={12} />
            Share your link
          </div>
          <ShareReferral
            referralCode={standing.referralCode}
            source='player_card'
            withShareButtons={false}
          />
        </div>
      </div>

      <button
        type='button'
        onClick={() => {
          showPanel('prizes')
          trackEvent({ event: 'cta_click', cta_name: 'player_card_rewards' })
        }}
        className='btn-lift flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:border-dark hover:text-dark dark:hover:border-lime dark:hover:text-lime'
      >
        <HugeiconsIcon icon={ChampionIcon} size={16} />
        View Prizes, Winners &amp; Invite Friends
      </button>
    </>
  )
}
