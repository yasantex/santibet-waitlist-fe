'use client'

import SectionHead from './SectionHead'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'
import type { Money, PrizeTierRule } from '../types/campaign'

function formatMoney(money: Money) {
  const prefix = money.currency === 'NGN' ? '₦' : `${money.currency} `
  return `${prefix}${Number(money.amount).toLocaleString()}`
}

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
          title='Every correct prediction is an entry'
          subtitle={
            totalWinners
              ? `${totalWinners} winners on launch day — not just one.`
              : 'Multiple winners on launch day — not just one.'
          }
        />
        <div className='mx-auto max-w-180 rounded-2xl border border-dashed border-border bg-plain px-9 py-11 text-center'>
          {!launchTiers ? (
            <div className='py-6 text-sm text-neutral-10'>
              Loading prize table…
            </div>
          ) : (
            <>
              <div className='relative inline-block px-2'>
                <span
                  aria-hidden='true'
                  className='absolute inset-x-0 bottom-[0.12em] h-[0.26em] rotate-1 bg-brand-green'
                />
                <span className='relative font-display text-[clamp(38px,6.5vw,58px)] font-extrabold tracking-[-0.01em] text-black'>
                  {headline ? formatMoney(headline.amount) : '—'}
                </span>
              </div>
              <div className='mt-2 text-xs tracking-[2px] text-neutral-10 uppercase'>
                {headline
                  ? `Grand Prize · ${headline.kind === 'CASH' ? 'Cash' : headline.kind === 'AIRTIME' ? 'Airtime' : 'Welcome bonus'} · ${headline.winnerCount} winner${headline.winnerCount > 1 ? 's' : ''}`
                  : 'No launch-day tiers published yet'}
              </div>

              {otherTiers && otherTiers.length > 0 && (
                <div className='mt-6 border-t border-dashed border-border pt-6 text-left'>
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
                        className='flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-b-0'
                      >
                        <div>
                          <div className='font-display text-lg font-bold tracking-[0.3px] text-black uppercase'>
                            {tier.name}
                          </div>
                          <div className='mt-0.5 text-[13px] text-placeholder'>
                            {tier.sub}
                          </div>
                        </div>
                        <div className='shrink-0 text-right'>
                          <div className='text-sm font-bold text-success'>
                            {tier.winners}
                          </div>
                          <div className='mt-0.5 text-[11px] text-neutral-10'>
                            {tier.cap}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className='mt-5.5 border-t border-dashed border-border pt-4 text-left text-[11.5px] leading-relaxed text-neutral-10'>
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
