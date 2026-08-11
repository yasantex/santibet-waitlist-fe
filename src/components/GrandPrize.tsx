import { prizeTiers } from '../utils/data'
import SectionHead from './SectionHead'

export default function GrandPrize() {
  return (
    <section id='grand' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Grand prize draw'
          title='Every correct prediction is an entry'
          subtitle='21 winners on launch day — not just one.'
        />
        <div className='mx-auto max-w-180 rounded-2xl border border-gold bg-linear-to-b from-navy-2 to-navy-1 px-9 py-11 text-center'>
          <div className='font-display text-[clamp(38px,6.5vw,58px)] font-extrabold tracking-[0.5px] text-gold-bright'>
            ₦1,000,000
          </div>
          <div className='mt-1.5 font-mono text-xs tracking-[2px] text-slate uppercase'>
            Grand Prize · Cash · 1 winner
          </div>

          <div className='mt-.5 border-t border-line pt-6 text-left'>
            {prizeTiers.map((tier) => (
              <div
                key={tier.name}
                className='flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-b-0'
              >
                <div>
                  <div className='font-display text-lg font-bold tracking-[0.3px] uppercase'>
                    {tier.name}
                  </div>
                  <div className='mt-0.5 text-[13px] text-paper-dim'>
                    {tier.sub}
                  </div>
                </div>
                <div className='shrink-0 text-right'>
                  <div className='font-mono text-sm font-bold text-gold-bright'>
                    {tier.winners}
                  </div>
                  <div className='mt-0.5 font-mono text-[11px] text-slate'>
                    {tier.cap}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-5.5 border-t border-dashed border-line pt-4 text-left text-[11.5px] leading-relaxed text-slate'>
            Welcome bonus prizes are wagering credits for use on SantiBet. Terms
            and conditions apply — maximum payout amounts apply per tier as
            stated above.
          </div>
        </div>
      </div>
    </section>
  )
}
