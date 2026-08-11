import { journeySteps } from '../utils/data'
import SectionHead from './SectionHead'

export default function Journey() {
  return (
    <section id='journey' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead kicker='Your journey' title='Why you keep coming back' />
        <div className='mx-auto max-w-120'>
          {journeySteps.map((step, i) => (
            <div key={step.when}>
              <div
                className={`flex items-center justify-between gap-4 rounded-xl border bg-navy-2 px-5.5 py-5 ${
                  step.final ? 'border-gold' : 'border-line'
                }`}
              >
                <div>
                  <div className='mb-1 font-mono text-[11px] tracking-wide text-gold-bright uppercase'>
                    {step.when}
                  </div>
                  <div className='font-display text-[19px] font-bold uppercase'>
                    {step.what}
                  </div>
                </div>
              </div>
              {i < journeySteps.length - 1 && (
                <div className='py-2 text-center font-mono text-xl text-line'>
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
