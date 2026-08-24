'use client'

import { previousResult } from '../utils/data'
import SectionHead from './SectionHead'
import {
  useActiveCampaign,
  useCampaignActivity,
  usePreviousQuestion,
} from '../hooks/useCampaign'
import type { ActivityItem, Money } from '../types/campaign'

const mockFeedItems = [
  { id: 1, html: '<strong>David</strong> just joined' },
  { id: 2, html: '<strong>Esther</strong> moved up to Rank #42' },
  { id: 3, html: '<strong>15,284</strong> people predicted YES today' },
  { id: 4, html: '<strong>7</strong> winners just announced' },
  { id: 5, html: 'Founder <strong>#18,447</strong> just joined' },
]

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
  const { data: activity } = useCampaignActivity(activeCampaign?.slug, 5)
  const { data: previous, isError: previousError } = usePreviousQuestion(
    activeCampaign?.slug,
  )

  const feedItems = activity?.data.length
    ? activity.data.map((item, i) => ({ id: i, html: activityHtml(item) }))
    : mockFeedItems
  const showLivePrevious = Boolean(previous) && !previousError

  return (
    <section id='proof' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Right now'
          title="It's already happening"
          subtitle='Live predictions and real payouts — updated every day, not just at launch.'
        />

        <div className='mx-auto grid max-w-225 grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Live activity panel */}
          <div className='overflow-hidden rounded-xl bg-plain'>
            <div className='flex items-center gap-2 border-b border-dashed border-border px-5.5 py-3.5'>
              <span className='h-1.75 w-1.75 rounded-full bg-success' />
              <span className='text-xs  text-neutral-10'>Live activity</span>
            </div>
            {feedItems.map((item) => (
              <div
                key={item.id}
                className='animate-feed-in flex items-center gap-3 border-b border-border px-5.5 py-3.5 text-sm text-placeholder last:border-b-0 [&_strong]:text-black'
                dangerouslySetInnerHTML={{ __html: item.html }}
              />
            ))}
          </div>

          {/* Yesterday's result panel */}
          <div className='rounded-xl bg-plain px-7 py-6.5'>
            <div className='mb-4 flex items-center justify-between'>
              <div className=' text-xs  text-neutral-10 uppercase'>
                {showLivePrevious ? `Day ${previous!.campaignDay}` : previousResult.day}
              </div>
              <div className='inline-block -rotate-3 rounded-md border-2 border-market-success px-3 py-1  text-[10.5px] font-bold tracking-[2px] text-market-success uppercase'>
                {showLivePrevious ? previous!.status.toLowerCase() : 'Resolved'}
              </div>
            </div>
            <div className='mb-5 font-display text-[19px] leading-[1.2] font-bold text-black uppercase'>
              {showLivePrevious ? previous!.text : previousResult.question}
            </div>
            {showLivePrevious ? (
              <div className='grid grid-cols-2 gap-3'>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Correct answer
                  </div>
                  <div className=' text-[18px] font-bold text-success'>
                    {previous!.outcome ?? 'Pending'}
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Resolved at
                  </div>
                  <div className=' text-[18px] font-bold text-success'>
                    {previous!.resolvedAt
                      ? new Date(previous!.resolvedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-3'>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Correct answer
                  </div>
                  <div className=' text-[18px] font-bold text-success'>
                    {previousResult.correctAnswer.toUpperCase()}
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Winning users
                  </div>
                  <div className=' text-[18px] font-bold text-success'>
                    {previousResult.winningUsers}
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Winners paid
                  </div>
                  <div className=' text-[18px] font-bold text-success'>
                    {previousResult.dailyWinnersPaid}
                  </div>
                </div>
                <div className='rounded-[10px] bg-white px-4 py-3.5'>
                  <div className='mb-1  text-[10px] tracking-wide text-neutral-10 uppercase'>
                    Total predictions
                  </div>
                  <div className=' text-[18px] font-bold text-success'>
                    {previousResult.totalPredictions}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
