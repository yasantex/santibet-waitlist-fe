'use client'

import { useState } from 'react'
import { founderBenefits, trackEvent } from '../utils/constants'
import SectionHead from './SectionHead'
import LevelInfoModal from './LevelInfoModal'
import { Icon, type IconName } from './icons'
import { useActiveCampaign, useCampaignRules, useMe } from '../hooks/useCampaign'
import { useAppSelector } from '../redux/hooks'

const LEVEL_ICON: Record<string, IconName> = {
  rookie: 'badge',
  rising: 'star',
  insider: 'star',
  pro: 'trophy',
  analyst: 'target',
  elite: 'shield',
  strategist: 'shield',
  legend: 'crown',
  oracle: 'crown',
}

export default function FounderProgram() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const { data: meStanding } = useMe(activeCampaign?.slug)
  const cachedStanding = useAppSelector((s) => s.campaign.standing)
  const standing = meStanding ?? cachedStanding
  const levels = rules?.levels.slice().sort((a, b) => a.minPoints - b.minPoints)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  return (
    <section id='founder' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Founder Tiers'
          title={
            <>
              Start as a Rookie.
              <br />
              Climb your way up.
            </>
          }
          subtitle='Every correct prediction is a step up the ladder — and every tier unlocks more.'
        />
        {levels && levels.length > 0 && (
          <div className='relative mx-auto max-w-250'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:grid-cols-5'>
              {levels.map((level, i) => {
                const isTop = i === levels.length - 1
                return (
                  <button
                    type='button'
                    key={level.key}
                    onClick={() => {
                      setSelectedLevel(level.key)
                      trackEvent({ event: 'founder_tier_opened', tier: level.key })
                    }}
                    aria-label={`What is the ${level.name} tier?`}
                    className='btn-lift flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface py-4.5 text-center hover:border-dark dark:hover:border-lime'
                  >
                    <div
                      className={`flex h-13 w-13 items-center justify-center rounded-full ${
                        isTop
                          ? 'bg-lime text-lime-ink'
                          : 'bg-surface-2 text-dark dark:text-lime'
                      }`}
                    >
                      <Icon
                        name={LEVEL_ICON[level.key] ?? 'star'}
                        className='h-5.5 w-5.5'
                      />
                    </div>
                    <div className='font-display text-[11px] font-bold text-ink uppercase leading-tight px-1'>
                      {level.name}
                    </div>
                    <div className='text-sm font-semibold text-muted'>
                      {level.minPoints}+ pts
                    </div>
                  </button>
                )
              })}
            </div>
            <div className='mt-3 text-center text-xs font-semibold text-muted'>
              Tap a tier to see what it means and how to reach it.
            </div>
            <LevelInfoModal
              open={selectedLevel != null}
              onClose={() => setSelectedLevel(null)}
              levels={levels}
              selectedKey={selectedLevel}
              scoring={rules?.scoring}
              myPoints={standing?.points}
            />
          </div>
        )}


        <div className='mx-auto mt-11 max-w-190'>
          <div className='mb-4 text-center text-xs font-bold tracking-[0.08em] text-muted uppercase'>
            What every Founder unlocks
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:grid-cols-3'>
            {founderBenefits.map((benefit) => (
              <div
                key={benefit.text}
                className='flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3.25'
              >
                <Icon
                  name={benefit.icon}
                  className='h-5 w-5 text-dark dark:text-lime'
                />
                <span className='text-sm text-center font-bold text-ink'>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='mx-auto mt-9 max-w-140 border-t border-dashed border-border pt-5 text-center  text-[16.5px] text-success'>
          Founder perks are reserved for users who join before launch.
        </div>
      </div>
    </section>
  )
}
