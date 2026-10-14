import type { PredictionSide } from '../../utils/types'

/** The picked side as a solid bar — the same lime for YES and NO, so neither reads as "right". */
export default function SelectionChoice({ side }: { side: PredictionSide }) {
  return (
    <div className='flex items-center justify-center rounded-xl bg-lime px-4 py-2.5 text-[15px] font-bold tracking-[0.05em] text-lime-ink uppercase shadow-[0_4px_16px_rgb(191_250_0/0.3)]'>
      {side}
    </div>
  )
}
