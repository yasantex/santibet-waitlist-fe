import type { PredictionSide } from '../../utils/types'
import type { PredictionParticipant } from '../../types/campaign'
import ShareReferral from './ShareReferral'
import { BACK_LINK_CLASS } from './utils'

interface DoneStepProps {
  pickedSide: PredictionSide | null
  /** Founder details of the number the call went in for; null when we don't have them. */
  founder: PredictionParticipant | null
  closesClock: string
  onPredictAnother: () => void
}

function CheckIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-6 w-6'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m4 12 6 6L20 6' />
    </svg>
  )
}

function FounderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-[10px] border border-border bg-paper px-4 py-3.5'>
      <div className='mb-1 text-[14px] tracking-wide text-neutral-10 uppercase'>
        {label}
      </div>
      <div className='text-[17px] font-bold text-success'>{value}</div>
    </div>
  )
}

export default function DoneStep({
  pickedSide,
  founder,
  closesClock,
  onPredictAnother,
}: DoneStepProps) {
  return (
    <div className='px-7.5 pt-6 pb-7.5 text-center'>
      <div className='mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-full bg-lime text-lime-ink'>
        <CheckIcon />
      </div>
      <div className='mb-1 font-display text-[19px] font-black text-ink'>
        You&apos;re locked in!
      </div>
      <div className='mb-4.5 text-[13px] text-muted'>
        Your {pickedSide?.toUpperCase()} prediction is saved. Come back
        tomorrow for a new one.
      </div>

      {founder && (
        <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left'>
          <FounderStat
            label='Founder Number'
            value={`#${founder.participantNumber.toLocaleString()}`}
          />
          <FounderStat
            label='Current Founder rank'
            value={
              founder.rank != null ? `#${founder.rank.toLocaleString()}` : '—'
            }
          />
        </div>
      )}

      <div className='mb-4.5 inline-flex items-center gap-2.5 rounded-full border border-border bg-paper px-4.5 py-2.5 text-sm text-neutral-10'>
        Today&apos;s window closes in{' '}
        <b className='text-[15px] text-ink'>{closesClock}</b>
      </div>

      {founder && <ShareReferral referralCode={founder.referralCode} />}

      <button
        type='button'
        onClick={onPredictAnother}
        className={`mt-4 ${BACK_LINK_CLASS}`}
      >
        Predicting for someone else on this device? Use another number
      </button>
    </div>
  )
}
