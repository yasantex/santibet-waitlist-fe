import { journeySteps } from '../utils/data'
import SectionHead from './SectionHead'

export default function HowItWorks() {
  return (
    <section id='how' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='How it works'
          title={
            <>
              Five stages.
              <br />
              One big finish.
            </>
          }
          subtitle='Small wins today, a legacy rank by launch. Every correct call moves the needle.'
        />
        <div className='mx-auto flex max-w-100 md:max-w-none flex-col gap-2.5 md:grid md:grid-cols-5'>
          {journeySteps.map((step, i) => (
            <div
              key={step.when}
              className={`flex items-center md:flex-col md:items-start gap-3.5 md:gap-2.5 rounded-2xl border px-4.5 py-4 md:px-5 md:py-5 ${
                step.final
                  ? 'border-dark bg-dark dark:border-lime dark:bg-lime'
                  : 'border-border bg-surface'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  step.final
                    ? 'bg-lime text-lime-ink dark:bg-lime-ink dark:text-lime'
                    : 'bg-dark text-lime dark:border dark:border-border dark:bg-surface-2'
                }`}
              >
                {i + 1}
              </div>
              <div>
                <div
                  className={`mb-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${
                    step.final
                      ? 'text-lime dark:text-lime-ink'
                      : 'text-success'
                  }`}
                >
                  {step.when}
                </div>
                <div
                  className={`font-display text-[15.5px] font-black ${
                    step.final ? 'text-white dark:text-lime-ink' : 'text-ink'
                  }`}
                >
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
