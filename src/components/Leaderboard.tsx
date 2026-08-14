import { leaderboard } from '../utils/data'
import SectionHead from './SectionHead'

export default function Leaderboard() {
  return (
    <section id='leaderboard' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Current Founder rankings'
          title='Top 100 climb before launch'
          subtitle='Permanent recognition, a Founder Badge, special launch rewards, and VIP status for the earliest 100.'
        />
        <div className='mx-auto max-w-160 overflow-hidden rounded-xl bg-plain'>
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className='grid grid-cols-[36px_1fr_auto] items-center gap-3.5 border-b border-border px-5.5 py-3.5 text-[14.5px] last:border-b-0'
            >
              {entry.top ? (
                <span className='flex h-7 w-7 items-center justify-center rounded-full bg-success  text-[12px] font-bold text-white'>
                  {entry.rank}
                </span>
              ) : (
                <span className='text-center  font-bold text-neutral-10'>
                  {entry.rank}
                </span>
              )}
              <span className='text-black'>{entry.name}</span>
              <span className=' text-placeholder'>{entry.points}</span>
            </div>
          ))}
          <div className='p-4 text-center  text-xs text-neutral-10'>
            — 95 more Founders climbing the board —
          </div>
        </div>
      </div>
    </section>
  )
}
