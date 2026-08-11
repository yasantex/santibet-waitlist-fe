import { leaderboard } from '../utils/data'
import SectionHead from './SectionHead'

export default function Leaderboard() {
  return (
    <section id='leaderboard' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Current Founder rankings'
          title='Top 100 climb before launch'
          subtitle='Permanent recognition, a Founder Badge, special launch rewards, and VIP status for the earliest 100.'
        />
        <div className='mx-auto max-w-160 overflow-hidden rounded-xl border border-line bg-navy-2'>
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className='grid grid-cols-[44px_1fr_auto] items-center gap-3.5 border-b border-line px-5.5 py-3.5 text-[14.5px] last:border-b-0'
            >
              <span
                className={`font-mono font-bold ${entry.top ? 'text-gold-bright' : 'text-slate'}`}
              >
                {entry.rank}
              </span>
              <span className='text-paper'>{entry.name}</span>
              <span className='font-mono text-paper-dim'>{entry.points}</span>
            </div>
          ))}
          <div className='p-4 text-center font-mono text-xs text-slate'>
            — 95 more Founders climbing the board —
          </div>
        </div>
      </div>
    </section>
  )
}
