import type { PredictionSide } from '../../utils/types'

interface PickStepProps {
  /** YES share for the open question; null when we have none for it. */
  yesPercent: number | null
  pickedSide: PredictionSide | null
  /** Masked number shown to a returning player; null for a new one. */
  predictingAsLabel: string | null
  onPick: (side: PredictionSide) => void
}

export default function PickStep({
  yesPercent,
  pickedSide,
  predictingAsLabel,
  onPick,
}: PickStepProps) {
  const percent: Record<PredictionSide, number | null> = {
    yes: yesPercent,
    no: yesPercent != null ? 100 - yesPercent : null,
  }

  return (
    <>
      {/* Both sides look identical — styling must never hint at which answer is right. */}
      <div className='grid grid-cols-2 gap-2.5'>
        {(['yes', 'no'] as const).map((side) => (
          <button
            key={side}
            type='button'
            onClick={() => onPick(side)}
            aria-pressed={pickedSide === side}
            className='btn-lift flex min-h-14 lg:min-h-24 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-border bg-surface-2 px-3 py-3 text-foreground hover:border-dark aria-pressed:border-lime aria-pressed:bg-lime aria-pressed:text-lime-ink dark:hover:border-lime'
          >
            <span className='text-base font-bold tracking-[0.05em] uppercase lg:text-xl'>{side}</span>
            {percent[side] != null && (
              <span className='text-[11px] font-medium opacity-70 lg:text-xs'>
                {percent[side]}% of predictions
              </span>
            )}
          </button>
        ))}
      </div>

      {predictingAsLabel && (
        <div className='mt-2.5 text-center text-xs font-medium text-muted'>
          Predicting as{' '}
          <strong className='font-semibold text-foreground'>{predictingAsLabel}</strong> — you can
          switch numbers after you pick.
        </div>
      )}
    </>
  )
}
