import { STAGE_ORDER, type Stage } from './utils'

export default function StepProgress({ stage }: { stage: Stage }) {
  const currentIndex = STAGE_ORDER.indexOf(stage)
  return (
    <div className='flex gap-1.5 px-7.5 pt-4'>
      {STAGE_ORDER.map((s, i) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full ${
            i <= currentIndex ? 'bg-lime' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}
