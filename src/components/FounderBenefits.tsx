import { founderBenefits } from '../utils/data'
import SectionHead from './SectionHead'

export default function FounderBenefits() {
  return (
    <section id='founder' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Founder benefits'
          title='Only available before launch'
          subtitle='Once SantiBet goes live, these are gone. Everyone who plays now qualifies to unlock them.'
        />
        <div className='mx-auto grid max-w-225 grid-cols-1 gap-4.5 sm:grid-cols-2 md:grid-cols-3'>
          {founderBenefits.map((benefit) => (
            <div
              key={benefit.text}
              className='rounded-xl border border-line bg-navy-2 px-4.5 py-5.5 text-center'
            >
              <div className='mb-2.5 text-[26px]'>{benefit.icon}</div>
              <p className='text-[13.5px] text-paper-dim'>{benefit.text}</p>
            </div>
          ))}
        </div>
        <div className='mx-auto mt-8 max-w-140 border-t border-dashed border-line pt-5 text-center font-mono text-[12.5px] text-gold-bright'>
          These rewards will never be available to users who join after launch.
        </div>
      </div>
    </section>
  )
}
