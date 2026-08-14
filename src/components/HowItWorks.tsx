import { journeySteps } from '../utils/data'
import SectionHead from './SectionHead'

export default function HowItWorks() {
  return (
    <section id='how' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='How it works'
          title="From today's call to launch day"
        />
        <div className='mx-auto max-w-100'>
          {journeySteps.map((step, i) => (
            <div key={step.when} className='fle items-center justify-center text-center gap-4'>
              <div
                className={`mb-5 flex-1 rounded-xl px-5.5 py-5 ${
                  step.final ? 'bg-surface-success' : 'bg-plain'
                }`}
              >
                <div
                  className={`mb-1 text-sm tracking-wide ${
                    step.final ? 'text-market-success' : 'text-success'
                  }`}
                >
                  {step.when}
                </div>
                <div className='font-display text-[19px] font-bold text-black'>
                  {step.what}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
