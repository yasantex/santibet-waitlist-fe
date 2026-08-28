'use client'

import SectionHead from './SectionHead'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import type { PrizeTierRule } from '../types/campaign'

function tierSub(tier: PrizeTierRule) {
  const kindLabel =
    tier.kind === 'CASH'
      ? 'cash'
      : tier.kind === 'AIRTIME'
        ? 'airtime'
        : 'SantiBet welcome bonus'
  return `${formatMoney(tier.amount)} ${kindLabel} each`
}

export default function GrandPrize() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)

  const launchTiers = rules?.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)

  const headline = launchTiers?.[0]
  const otherTiers = launchTiers?.slice(1)
  const totalWinners = launchTiers?.reduce((sum, t) => sum + t.winnerCount, 0)

  return (
    <section id='grand' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Grand prize draw'
          title={
            <>
              Every call is
              <br />a lottery ticket.
            </>
          }
          subtitle={
            totalWinners
              ? `${totalWinners} winners walk away on launch day — not one lucky person, ${totalWinners}.`
              : 'Multiple winners walk away on launch day — not just one.'
          }
        />
        <div className='relative mx-auto max-w-180 overflow-hidden rounded-3xl bg-dark px-9 py-11 text-center dark:border dark:border-border dark:bg-surface-2'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-dark-2 opacity-70 dark:bg-lime dark:opacity-[0.05]'
          />
          {!launchTiers ? (
            <div className='relative py-6 text-lg text-white/70 dark:text-muted'>
              Loading prize table…
            </div>
          ) : (
            <>
              <div className='relative font-display text-[clamp(38px,6.5vw,58px)] font-black tracking-[-0.01em] text-white dark:text-ink'>
                {headline ? formatMoney(headline.amount) : '—'}
              </div>
              <div className='relative mt-2 text-xs font-bold tracking-[0.08em] text-lime uppercase'>
                {headline
                  ? `Grand Prize · ${headline.kind === 'CASH' ? 'Cash' : headline.kind === 'AIRTIME' ? 'Airtime' : 'Welcome bonus'} · ${headline.winnerCount} winner${headline.winnerCount > 1 ? 's' : ''} · On Launch Day`
                  : 'No launch-day tiers published yet'}
              </div>

              {otherTiers && otherTiers.length > 0 && (
                <div className='relative mt-6 border-t border-dashed border-white/15 pt-6 text-left dark:border-border'>
                  {otherTiers
                    .map((tier) => ({
                      key: tier.place,
                      name:
                        tier.place === 2
                          ? '2nd Prize'
                          : tier.place === 3
                            ? '3rd Prize'
                            : tier.name,
                      sub: tierSub(tier),
                      winners: `${tier.winnerCount} winners`,
                      cap: tier.maxPayout
                        ? `Max ${formatMoney(tier.maxPayout)} payout`
                        : '',
                    }))
                    .map((tier) => (
                      <div
                        key={tier.key}
                        className='flex md:flex-row flex-col items-start md:items-center justify-between gap-4 border-b border-dashed border-white/15 py-3.5 last:border-b-0 dark:border-border'
                      >
                        <div>
                          <div className='font-display text-lg font-black tracking-[0.3px] text-white uppercase dark:text-ink'>
                            {tier.name}
                          </div>
                          <div className='mt-0.5 text-[17px] text-white/55 dark:text-muted'>
                            {tier.sub}
                          </div>
                        </div>
                        <div className='shrink-0 text-left md:text-right'>
                          <div className='text-lg font-bold text-lime'>
                            {tier.winners}
                          </div>
                          <div className='mt-0.5 text-[15px] text-white/55 dark:text-muted'>
                            {tier.cap}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className='relative mt-5.5 border-t border-dashed border-white/15 pt-4 text-left text-[15.5px] leading-relaxed text-white/55 dark:border-border dark:text-muted'>
                Welcome bonus prizes are wagering credits for use on SantiBet.
                Terms and conditions apply — maximum payout amounts apply per
                tier as stated above.
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
