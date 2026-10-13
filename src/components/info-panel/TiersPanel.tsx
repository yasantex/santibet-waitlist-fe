'use client'

import { useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Book02Icon,
  ChartUpIcon,
  Clock01Icon,
  CrownIcon,
  Medal01Icon,
  Shield01Icon,
  SparklesIcon,
  StarIcon,
  UserIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import {
  useActiveCampaign,
  useCampaignRules,
  useStanding,
} from '../../hooks/useCampaign'
import { founderBenefits, trackEvent } from '../../utils/constants'
import { levelProgress, sortLevels } from '../../utils/levels'
import LevelInfoModal from '../modals/LevelInfoModal'
import SectionTitle, { PanelMessage } from './SectionTitle'

const LEVEL_ICON: Record<string, IconSvgElement> = {
  rookie: UserIcon,
  rising: ChartUpIcon,
  insider: Clock01Icon,
  pro: Medal01Icon,
  analyst: ViewIcon,
  elite: Shield01Icon,
  strategist: Book02Icon,
  legend: CrownIcon,
  oracle: StarIcon,
}

export default function TiersPanel() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const standing = useStanding(activeCampaign?.slug)
  const levels = sortLevels(rules?.levels)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const currentKey = standing
    ? levelProgress(levels, standing.points).current?.key
    : null

  return (
    <div>
      <SectionTitle icon={StarIcon}>Founder Tiers</SectionTitle>
      {!rules ? (
        <PanelMessage>Loading tiers…</PanelMessage>
      ) : (
        <>
          <div className='grid grid-cols-3 gap-2'>
            {levels.map((level) => {
              const active = level.key === currentKey
              return (
                <button
                  key={level.key}
                  type='button'
                  onClick={() => {
                    setSelectedLevel(level.key)
                    trackEvent({ event: 'founder_tier_opened', tier: level.key })
                  }}
                  aria-label={`What is the ${level.name} tier?`}
                  className={`btn-lift flex flex-col items-center rounded-xl border px-1 py-2.5 text-center ${
                    active
                      ? 'border-success bg-success/10 shadow-[0_0_12px_rgb(22_163_74/0.2)]'
                      : 'border-border bg-surface-2 hover:border-dark dark:hover:border-lime'
                  }`}
                >
                  <span
                    className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border ${
                      active
                        ? 'border-lime bg-lime text-lime-ink'
                        : 'border-border bg-surface text-muted'
                    }`}
                  >
                    <HugeiconsIcon icon={LEVEL_ICON[level.key] ?? StarIcon} size={15} />
                  </span>
                  <span className='w-full truncate text-[10px] font-bold tracking-[0.04em] text-foreground uppercase'>
                    {level.name}
                  </span>
                  <span
                    className={`text-[10px] ${active ? 'font-semibold text-success' : 'text-muted'}`}
                  >
                    {level.minPoints}+ pts
                  </span>
                </button>
              )
            })}
          </div>
          <div className='mt-2 text-center text-[11px] text-muted'>
            Tap a tier to see what it means and how to reach it.
          </div>
          <LevelInfoModal
            open={selectedLevel != null}
            onClose={() => setSelectedLevel(null)}
            levels={levels}
            selectedKey={selectedLevel}
            scoring={rules.scoring}
            myPoints={standing?.points}
          />
        </>
      )}

      <SectionTitle icon={SparklesIcon} className='mt-5'>
        What Every Founder Unlocks
      </SectionTitle>
      <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2'>
        {founderBenefits.map((benefit) => (
          <div
            key={benefit.text}
            className='flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-2'
          >
            <HugeiconsIcon
              icon={benefit.icon}
              size={16}
              className='shrink-0 text-dark dark:text-lime'
            />
            <span className='text-xs font-medium text-foreground'>{benefit.text}</span>
          </div>
        ))}
      </div>
      <div className='mt-3 text-center text-[11px] text-success'>
        Founder perks are reserved for users who join before launch.
      </div>
    </div>
  )
}
