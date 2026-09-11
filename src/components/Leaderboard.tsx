'use client'

import SectionHead from './SectionHead'
import { useActiveCampaign, useLeaderboard, useMe } from '../hooks/useCampaign'
import { useAppSelector } from '../redux/hooks'

export default function Leaderboard() {
  const { activeCampaign } = useActiveCampaign()
  const { data, isLoading } = useLeaderboard(activeCampaign?.slug, 5)
  const { data: meStanding } = useMe(activeCampaign?.slug)
  const cachedStanding = useAppSelector((s) => s.campaign.standing)
  const standing = meStanding ?? cachedStanding
  const rows = data?.data ?? []

  const remaining = activeCampaign
    ? Math.max(activeCampaign.participantCount - rows.length, 0)
    : 0

  return (
    <section id='leaderboard' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Founder Rankings'
          title={
            <>
              Your name.
              <br />
              Your rank. Forever.
            </>
          }
          subtitle='The first 100 Founders get permanent bragging rights — and the perks to back it up.'
        />
        <div className='mx-auto max-w-160 overflow-hidden rounded-xl border border-border bg-surface'>
          {isLoading ? (
            <div className='p-6 text-center text-lg text-neutral-10'>
              Loading leaderboard…
            </div>
          ) : rows.length === 0 ? (
            <div className='p-6 text-center text-lg text-neutral-10'>
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
                    <span className='flex h-7 w-7 items-center justify-center rounded-full bg-lime text-sm font-bold text-lime-ink'>
                      {String(entry.rank ?? i + 1).padStart(2, '0')}
                    </span>
                  ) : (
                    <span className='flex h-7 w-7 items-center justify-center rounded-full bg-dark text-sm font-bold text-lime dark:border dark:border-border dark:bg-surface-2'>
                      {String(entry.rank ?? i + 1).padStart(2, '0')}
                    </span>
                  )}
                  <span className='text-ink font-bold'>
                    Founder #{entry.participantNumber}
                  </span>
                  <span className='text-dark font-bold dark:text-lime'>
                    {entry.points} pts
                  </span>
                </div>
              ))}
              {remaining > 0 && (
                <div className='p-4 text-center  text-base text-neutral-10'>
                  — {remaining} more Founders climbing the board —
                </div>
              )}
            </>
          )}
        </div>

        {standing && (
          <div className='mx-auto mt-4 max-w-160'>
            <div className='mb-2 text-center text-xs font-bold tracking-[0.08em] text-muted uppercase'>
              Your ranking
            </div>
            <div className='grid grid-cols-[36px_1fr_auto] items-center gap-3.5 rounded-xl border-[1.5px] border-dark bg-surface px-5.5 py-3.5 text-[14.5px] dark:border-lime'>
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-lime text-sm font-bold text-lime-ink'>
                {standing.rank != null
                  ? String(standing.rank).padStart(2, '0')
                  : '—'}
              </span>
              <span className='text-ink font-bold'>
                Founder #{standing.participantNumber.toLocaleString()} (You)
              </span>
              <span className='text-dark font-bold'>
                {standing.points} pts
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
