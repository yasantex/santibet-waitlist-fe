import { founderLevels } from '../utils/data'
import SectionHead from './SectionHead'

export default function FounderLevels() {
  return (
    <section id='levels' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead kicker='Founder levels' title='Climb the ranks' />
        <div className='mx-auto grid max-w-225 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5'>
          {founderLevels.map((level) => (
            <div
              key={level.name}
              className='rounded-xl border border-line bg-navy-2 px-3 py-5 text-center'
            >
              <div className='mb-2 text-[26px]'>{level.icon}</div>
              <div className='mb-1 font-display text-base font-bold uppercase'>
                {level.name}
              </div>
              <div className='font-mono text-[11px] text-slate'>
                {level.points}
              </div>
            </div>
          ))}
        </div>
        <p className='mx-auto mt-7 max-w-140 text-center text-sm text-paper-dim'>
          Each level unlocks more at launch — a bigger welcome bonus, extra free
          prediction credits, a upgraded Founder badge, VIP promotions, and
          additional entries into the Grand Prize Draw.
        </p>
      </div>
    </section>
  )
}
