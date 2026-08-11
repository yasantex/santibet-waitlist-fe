import { referMilestones, referSteps } from '../utils/data'
import SectionHead from './SectionHead'

export default function ReferFriend() {
  return (
    <section id='refer' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Refer a friend'
          title='Climb faster together'
          subtitle='Every friend who joins and makes their first prediction moves you both up the board.'
        />

        <div className='mx-auto mb-10 grid max-w-225 grid-cols-1 gap-5 sm:grid-cols-3'>
          {referSteps.map((step) => (
            <div
              key={step.num}
              className='rounded-xl border border-line bg-navy-2 px-5.5 py-6.5'
            >
              <div className='mb-3 font-mono text-[13px] tracking-wide text-gold'>
                {step.num}
              </div>
              <div className='mb-2 font-display text-xl tracking-[0.3px] uppercase'>
                {step.what}
              </div>
              <div className='text-sm text-paper-dim'>{step.sub}</div>
            </div>
          ))}
        </div>

        <div className='mx-auto max-w-140 overflow-hidden rounded-xl border border-line bg-navy-2'>
          {referMilestones.map((m) => (
            <div
              key={m.count}
              className='flex items-center justify-between gap-4 border-b border-line px-5.5 py-4 text-[14.5px] last:border-b-0'
            >
              <div className='shrink-0 font-display text-lg uppercase text-paper'>
                {m.count}
              </div>
              <div className='text-right font-mono text-[13px] text-gold-bright'>
                {m.reward}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
