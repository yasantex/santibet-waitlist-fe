import { previousResult } from '../utils/data'
import SectionHead from './SectionHead'

export default function PreviousResults() {
  return (
    <section id='previous' className='border-b border-line py-17'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker="Yesterday's market"
          title='Real questions. Real winners.'
        />
        <div className='mx-auto max-w-140 rounded-[14px] border border-line bg-navy-2 px-7 py-6.5'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='font-mono text-[11px] tracking-[1.5px] text-slate uppercase'>
              {previousResult.day}
            </div>
            <div className='rounded-full border border-win px-3 py-1.25 font-mono text-[11px] font-bold tracking-wide text-win uppercase'>
              Resolved
            </div>
          </div>
          <div className='mb-5 font-display text-[22px] font-bold uppercase'>
            {previousResult.question}
          </div>
          <div className='grid grid-cols-2 gap-3.5'>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Correct answer
              </div>
              <div className='font-mono text-[19px] font-bold text-gold-bright'>
                {previousResult.correctAnswer.toUpperCase()}
              </div>
            </div>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Winning users
              </div>
              <div className='font-mono text-[19px] font-bold text-gold-bright'>
                {previousResult.winningUsers}
              </div>
            </div>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Daily winners paid
              </div>
              <div className='font-mono text-[19px] font-bold text-gold-bright'>
                {previousResult.dailyWinnersPaid}
              </div>
            </div>
            <div className='rounded-[10px] border border-line bg-navy-1 px-4 py-3.5'>
              <div className='mb-1 font-mono text-[10px] tracking-wide text-slate uppercase'>
                Total predictions
              </div>
              <div className='font-mono text-[19px] font-bold text-gold-bright'>
                {previousResult.totalPredictions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
