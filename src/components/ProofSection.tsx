'use client'

import SectionHead from './SectionHead'
import {
  useActiveCampaign,
  useCampaignActivity,
  // usePreviousQuestion,
} from '../hooks/useCampaign'
import type { ActivityItem, Money } from '../types/campaign'

function formatMoney(money: Money) {
  const prefix = money.currency === 'NGN' ? '₦' : `${money.currency} `
  return `${prefix}${Number(money.amount).toLocaleString()}`
}

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
  // const {
  //   data: previous,
  //   isLoading: previousLoading,
  //   isError: previousError,
  // } = usePreviousQuestion(activeCampaign?.slug)

  const feedItems = activity?.data ?? []
  // const hasPrevious = Boolean(previous) && !previousError

  return (
    <section id='proof' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Right now'
          title="It's already happening"
          subtitle='Live predictions and real payouts — updated every day, not just at launch.'
        />

          {/* Live activity panel */}
          <div className='overflow-hidden rounded-xl max-w-110 mx-auto bg-plain'>
            <div className='flex items-center gap-2 border-b border-dashed border-border px-5.5 py-3.5'>
              <span className='h-1.75 w-1.75 rounded-full bg-success' />
              <span className='text-xs  text-neutral-10'>Live activity</span>
            </div>
            {activityLoading ? (
              <div className='px-5.5 py-6 text-sm text-neutral-10'>
                Loading activity…
              </div>
            ) : feedItems.length === 0 ? (
              <div className='px-5.5 py-6 text-sm text-neutral-10'>
                Nothing yet — be the first to make a move.
              </div>
            ) : (
              feedItems.map((item, i) => (
                <div
                  key={i}
                  className='animate-feed-in flex items-center gap-3 border-b border-border px-5.5 py-3.5 text-sm text-placeholder last:border-b-0 [&_strong]:text-black'
                  dangerouslySetInnerHTML={{ __html: activityHtml(item) }}
                />
              ))
            )}
          </div>


      </div>
    </section>
  )
}
