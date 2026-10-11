import type { PredictionSide } from '../../utils/types'
import type { CampaignStats } from '../../types/campaign'
import { formatMoney } from '../../utils/constants'

interface PickStepProps {
  question: string
  stats: CampaignStats | undefined
  closesClock: string
  pickedSide: PredictionSide | null
  /** Masked number shown to a returning player; null for a new one. */
  predictingAsLabel: string | null
  onPick: (side: PredictionSide) => void
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className='text-center'>
      <div className='mb-1 text-[10.5px] font-bold tracking-[0.06em] text-neutral-10 uppercase'>
        {label}
      </div>
      <div
        className={`text-[15px] font-bold ${accent ? 'text-success' : 'text-ink'}`}
      >
        {value}
      </div>
    </div>
  )
}

export default function PickStep({
  question,
  stats,
  closesClock,
  pickedSide,
  predictingAsLabel,
  onPick,
}: PickStepProps) {
  const yesPercent = stats?.today?.yesPercent
  const noPercent = yesPercent != null ? 100 - yesPercent : undefined
  const yesPercentLabel =
    yesPercent != null ? `${yesPercent}%` : 'No predictions yet'
  const noPercentLabel =
    noPercent != null ? `${noPercent}%` : 'No predictions yet'
  const alreadyPredicted = (
    stats?.today?.predictions ??
    stats?.totalPredictions ??
    0
  ).toLocaleString()
  const prizePoolLabel = stats?.dailyPrizePool?.[0]
    ? formatMoney(stats.dailyPrizePool[0])
    : '—'

  return (
    <div className='px-7.5 pt-5 pb-6.5'>
      <div className='mb-3.5 text-xs font-bold uppercase tracking-[0.05em] text-success'>
        Make Today&apos;s Prediction
      </div>
      <div className='mb-5.5 font-display text-[26px] leading-8 font-black text-ink'>
        {question}
      </div>

      <div className='mb-5 flex md:flex-row flex-col gap-3'>
        <button
          type='button'
          onClick={() => onPick('yes')}
          aria-pressed={pickedSide === 'yes'}
          className='btn-lift relative flex-1 overflow-hidden rounded-xl border-2 border-dark bg-lime px-3.5 py-4 text-left text-[19px] font-black text-lime-ink hover:bg-[#cfff3d] dark:border-lime-ink'
        >
          <span className='relative z-10 block'>YES</span>
          <span className='relative z-10 mt-1 block text-[13px] font-semibold text-lime-ink/70'>
            {yesPercentLabel}
            {yesPercent != null && ' of predictions'}
          </span>
        </button>
        <button
          type='button'
          onClick={() => onPick('no')}
          aria-pressed={pickedSide === 'no'}
          className='btn-lift relative flex-1 overflow-hidden rounded-xl border-2 border-border bg-surface px-3.5 py-4 text-left font-display text-[19px] font-black tracking-wide text-ink hover:border-dark hover:bg-surface-2 dark:hover:border-lime'
        >
          <span className='relative z-10 block'>NO</span>
          <span className='relative z-10 mt-1 block text-[13px] font-semibold text-muted'>
            {noPercentLabel}
            {noPercent != null && ' of predictions'}
          </span>
        </button>
      </div>

      {predictingAsLabel && (
        <div className='-mt-2 mb-4 text-xs font-semibold text-muted'>
          Predicting as{' '}
          <strong className='text-ink'>{predictingAsLabel}</strong> — you can
          switch numbers after you pick.
        </div>
      )}

      <div className='grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-dashed border-border pt-4.5'>
        <StatCell label='Closes in' value={closesClock} accent />
        <StatCell label='Predictions made' value={alreadyPredicted} />
        <StatCell
          label={"Today's giveaway"}
          value={`${prizePoolLabel} AIRTIME & DATA`}
        />
      </div>
    </div>
  )
}
