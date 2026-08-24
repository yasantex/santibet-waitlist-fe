'use client'

import SectionHead from './SectionHead'
import { useActiveCampaign, useLeaderboard } from '../hooks/useCampaign'

export default function Leaderboard() {
  const { activeCampaign } = useActiveCampaign()
  const { data, isLoading } = useLeaderboard(activeCampaign?.slug, 5)
  const rows = data?.data ?? []

  const remaining = activeCampaign
    ? Math.max(activeCampaign.participantCount - rows.length, 0)
    : 0

  return (
    <section id='leaderboard' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Current Founder rankings'
          title='Top 100 climb before launch'
          subtitle='Permanent recognition, a Founder Badge, special launch rewards, and VIP status for the earliest 100.'
        />
        <div className='mx-auto max-w-160 overflow-hidden rounded-xl bg-plain'>
          {isLoading ? (
            <div className='p-6 text-center text-sm text-neutral-10'>
              Loading leaderboard…
            </div>
          ) : rows.length === 0 ? (
            <div className='p-6 text-center text-sm text-neutral-10'>
              No Founders on the board yet — be the first to predict.
            </div>
          ) : (
            <>
              {rows.map((entry, i) => (
                <div
                  key={entry.participantNumber}
                  className='grid grid-cols-[36px_1fr_auto] items-center gap-3.5 border-b border-border px-5.5 py-3.5 text-[14.5px] last:border-b-0'
                >
                  {i < 3 ? (
                    <span className='flex h-7 w-7 items-center justify-center rounded-full bg-brand-green  text-[12px] font-bold text-black'>
                      {String(entry.rank ?? i + 1).padStart(2, '0')}
                    </span>
                  ) : (
                    <span className='text-center  font-bold text-neutral-10'>
                      {String(entry.rank ?? i + 1).padStart(2, '0')}
                    </span>
                  )}
                  <span className='text-black'>
                    Founder #{entry.participantNumber}
                  </span>
                  <span className=' text-placeholder'>
                    {entry.points} pts
                  </span>
                </div>
              ))}
              {remaining > 0 && (
                <div className='p-4 text-center  text-xs text-neutral-10'>
                  — {remaining} more Founders climbing the board —
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
