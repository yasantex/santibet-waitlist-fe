import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import type { PredictionSide } from '../../utils/types'
import { BACK_LINK_CLASS } from './utils'

interface DoneStepProps {
  pickedSide: PredictionSide | null
  /** Masked number the prediction went in for, if we know it. */
  predictingAsLabel: string | null
  closesClock: string
  onViewEntry: () => void
  onPredictAnother: () => void
}

/** What the card shows once the prediction is in and the thank-you screen is closed. */
export default function DoneStep({
  pickedSide,
  predictingAsLabel,
  closesClock,
  onViewEntry,
  onPredictAnother,
}: DoneStepProps) {
  return (
    <div className='animate-slide-up'>
      <div className='flex items-center justify-center gap-2 rounded-xl border border-success/60 bg-success/10 px-3 py-3 text-center text-sm font-semibold text-success shadow-[0_0_16px_rgb(22_163_74/0.12)]'>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className='shrink-0' />
        <span>
          Your {pickedSide?.toUpperCase()} prediction is locked
          {predictingAsLabel ? ` for ${predictingAsLabel}` : ''}. Come back for the next
          question.
        </span>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-2'>
        <div className='rounded-xl border border-border bg-surface-2 px-3 py-2.5'>
          <div className='text-[10px] font-semibold tracking-[0.06em] text-muted uppercase'>
            Window closes in
          </div>
          <div className='text-lg font-extrabold text-foreground tabular-nums'>
            {closesClock}
          </div>
        </div>
        <button
          type='button'
          onClick={onViewEntry}
          className='btn-lift rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left hover:border-dark dark:hover:border-lime'
        >
          <div className='text-[10px] font-semibold tracking-[0.06em] text-muted uppercase'>
            Your entry
          </div>
          <div className='text-sm font-bold text-dark dark:text-lime'>View &amp; share →</div>
        </button>
      </div>

      <button
        type='button'
        onClick={onPredictAnother}
        className={`mt-3 ${BACK_LINK_CLASS}`}
      >
        Predicting for someone else on this device? Use another number
      </button>
    </div>
  )
}
