'use client'

import { founderBenefits } from '../utils/data'
import SectionHead from './SectionHead'
import { Icon, type IconName } from './icons'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'

const LEVEL_ICON: Record<string, IconName> = {
  rookie: 'badge',
  rising: 'star',
  pro: 'trophy',
  elite: 'shield',
  legend: 'crown',
}

export default function FounderProgram() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const levels = rules?.levels.slice().sort((a, b) => a.minPoints - b.minPoints)

  return (
    <section id='founder' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Founder Tiers'
          title={
            <>
              Rookie today.
              <br />
              Legendary by launch.
            </>
          }
          subtitle='Every correct call is a step up the ladder — and every tier unlocks more.'
        />
        {levels && levels.length > 0 && (
          <div className='relative mx-auto max-w-190'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:grid-cols-3'>
              {levels.map((level) => {
                const isTop = level.key === 'legend'
                return (
                  <div
                    key={level.key}
                    className='flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface py-4.5 text-center'
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
                  </div>
                )
              })}
            </div>
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
          These rewards will never be available to users who join after launch.
        </div>
      </div>
    </section>
  )
}
