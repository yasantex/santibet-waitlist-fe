import { founderBenefits, founderLevels } from '../utils/data'
import SectionHead from './SectionHead'

export default function FounderProgram() {
  return (
    <section id='founder' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Founder program'
          title='Level up before launch'
          subtitle='Every prediction earns points. Climb the ladder to unlock bigger rewards at launch.'
        />

        {/* Level ladder */}
        <div className='relative mx-auto max-w-225'>
          <div className='pointer-events-none absolute top-[22px] right-8 left-8 hidden border-t border-dashed border-border sm:block' />
          <div className='flex gap-7 overflow-x-auto pb-2 sm:justify-between sm:overflow-visible'>
            {founderLevels.map((level) => (
              <div
                key={level.name}
                className='flex shrink-0 flex-col items-center gap-2 text-center'
              >
                <div className='relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-white text-[20px]'>
                  {level.icon}
                </div>
                <div className='font-display text-sm font-bold text-black uppercase'>
                  {level.name}
                </div>
                <div className=' text-[10px] text-neutral-10'>
                  {level.points}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits checklist */}
        <div className='mx-auto mt-11 max-w-190'>
          <div className='mb-4 text-center  text-[11px] tracking-[2px] text-neutral-10 uppercase'>
            What every Founder unlocks
          </div>
          <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
            {founderBenefits.map((benefit) => (
              <div
                key={benefit.text}
                className='flex items-center gap-3 rounded-lg bg-plain px-4 py-3.25'
              >
                <span className='text-[18px]'>{benefit.icon}</span>
                <span className='text-[13.5px] text-placeholder'>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='mx-auto mt-9 max-w-140 border-t border-dashed border-border pt-5 text-center  text-[12.5px] text-success'>
          These rewards will never be available to users who join after launch.
        </div>
      </div>
    </section>
  )
}
