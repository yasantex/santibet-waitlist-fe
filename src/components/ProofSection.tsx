'use client'

import SectionHead from './SectionHead'
import {
  useActiveCampaign,
  useCampaignActivity,
  usePreviousQuestion,
} from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import type { ActivityItem } from '../types/campaign'

function activityHtml(item: ActivityItem) {
  switch (item.type) {
    case 'JOINED':
      return `<strong>${item.player}</strong> just joined`
    case 'PREDICTED':
      return `<strong>${item.player}</strong> predicted on Day ${item.campaignDay}`
    case 'CLIMBED':
      return `<strong>${item.player}</strong> moved up to Rank #${item.rank}`
    case 'WON':
      return `<strong>${item.player}</strong> just won ${formatMoney(item.amount)} — ${item.prizeName}`
  }
}

export default function ProofSection() {
  const { activeCampaign } = useActiveCampaign()
  const { data: activity, isLoading: activityLoading } = useCampaignActivity(
    activeCampaign?.slug,
    5,
  )
  const {
    data: previous,
    isLoading: previousLoading,
    isError: previousError,
  } = usePreviousQuestion(activeCampaign?.slug)

  const feedItems = activity?.data ?? []
  const hasPrevious = Boolean(previous) && !previousError

  return (
    <section id='proof' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Right now'
          title={
            <>
              Nobody&apos;s waiting
              <br />
              for launch day.
            </>
          }
          subtitle='Real people, real calls, real payouts — happening on the app every single day.'
        />

          {/* Live activity panel */}
          <div className='overflow-hidden rounded-xl max-w-110 mx-auto border border-border bg-surface'>
            <div className='flex items-center gap-2 border-b border-border px-5.5 py-3.5'>
              <span className='h-1.75 w-1.75 rounded-full bg-success' />
              <span className='text-sm font-bold text-ink'>
                On the ground right now
              </span>
            </div>
            {activityLoading ? (
              <div className='px-5.5 py-6 text-lg text-neutral-10'>
                Loading activity…
              </div>
            ) : feedItems.length === 0 ? (
              <div className='px-5.5 py-6 text-lg text-neutral-10'>
                Nothing yet — be the first to make a move.
              </div>
            ) : (
              feedItems.map((item, i) => (
                <div
                  key={i}
                  className='animate-feed-in flex items-center justify-between gap-3 border-b border-border px-5.5 py-3.5 text-base text-placeholder last:border-b-0 [&_strong]:text-ink'
                  dangerouslySetInnerHTML={{ __html: activityHtml(item) }}
                />
              ))
            )}
          </div>

          {/* Previous question, resolved */}
          {previousLoading ? (
            <div className='mx-auto mt-4 max-w-110 rounded-2xl bg-dark px-5.5 py-5 text-center text-white/70 dark:border dark:border-border dark:bg-surface-2 dark:text-muted'>
              Loading previous result…
            </div>
          ) : (
            hasPrevious &&
            previous && (
              <div className='mx-auto mt-4 max-w-110 overflow-hidden rounded-2xl bg-dark px-5.5 py-5 text-white dark:border dark:border-border dark:bg-surface-2 dark:text-ink'>
                <div className='mb-2 flex items-start justify-between gap-3'>
                  <span className='text-[10px] font-bold uppercase tracking-[0.06em] text-white/55 dark:text-muted'>
                    Day {previous.campaignDay}
                  </span>
                  <span className='shrink-0 rounded-full bg-lime px-2.5 py-1 text-[10px] font-black uppercase text-lime-ink'>
                    {previous.status === 'VOID' ? 'Voided' : 'Resolved'}
                  </span>
                </div>
                <div className='mb-4 font-display text-[17px] font-black leading-snug'>
                  {previous.text}
                </div>
                <div className='grid grid-cols-2 gap-x-6 gap-y-3.5'>
                  <div>
                    <div className='mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-white/50 dark:text-muted'>
                      Correct Answer
                    </div>
                    <div className='text-lg font-black text-lime'>
                      {previous.status === 'VOID'
                        ? '—'
                        : (previous.outcome ?? '—')}
                    </div>
                  </div>
                  <div>
                    <div className='mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-white/50 dark:text-muted'>
                      Got It Right
                    </div>
                    <div className='text-lg font-black text-lime'>
                      {previous.correct.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className='mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-white/50 dark:text-muted'>
                      Paid Out
                    </div>
                    <div className='text-lg font-black text-lime'>
                      {previous.payout != null
                        ? previous.payout.toLocaleString()
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <div className='mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-white/50 dark:text-muted'>
                      Total Calls
                    </div>
                    <div className='text-lg font-black text-lime'>
                      {previous.predictions.toLocaleString()}
                    </div>
                  </div>
                </div>
                {previous.evidenceUrl && (
                  <a
                    href={previous.evidenceUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-4 inline-block text-xs font-bold text-white/70 underline underline-offset-2 dark:text-muted'
                  >
                    View evidence
                  </a>
                )}
              </div>
            )
          )}

      </div>
    </section>
  )
}
