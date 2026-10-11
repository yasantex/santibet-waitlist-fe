import type { VerifiedNumber } from '../../redux/campaignSlice'
import { maskPhone } from './utils'

interface NumberSwitcherProps {
  predictingAsLabel: string
  /** Saved numbers other than the current one. */
  otherNumbers: VerifiedNumber[]
  open: boolean
  onToggle: () => void
  onSwitch: (phone: string) => void
  onAddNumber: () => void
}

/** "Predicting as 080••••1234" with a way to switch to another saved number or add one. */
export default function NumberSwitcher({
  predictingAsLabel,
  otherNumbers,
  open,
  onToggle,
  onSwitch,
  onAddNumber,
}: NumberSwitcherProps) {
  const canSwitch = otherNumbers.length > 0
  return (
    <div className='mb-4 rounded-xl border-[1.5px] border-border px-3.5 py-3'>
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
        <span className='text-[12.5px] font-semibold text-muted'>
          Predicting as{' '}
          <strong className='text-ink'>{predictingAsLabel}</strong>
        </span>
        <button
          type='button'
          onClick={canSwitch ? onToggle : onAddNumber}
          className='link-action text-xs font-bold text-dark dark:text-lime'
        >
          {open ? 'Close' : canSwitch ? 'Switch number' : 'Use another number'}
        </button>
      </div>

      {open && (
        <div className='mt-3 flex flex-wrap gap-2 border-t border-dashed border-border pt-3'>
          {otherNumbers.map((n) => (
            <button
              key={n.phone}
              type='button'
              onClick={() => onSwitch(n.phone)}
              className='btn-lift rounded-lg border-[1.5px] border-border bg-surface px-3 py-2 text-xs font-bold text-ink hover:border-dark dark:hover:border-lime'
            >
              {maskPhone(n.phone)}
            </button>
          ))}
          <button
            type='button'
            onClick={onAddNumber}
            className='btn-lift rounded-lg border-[1.5px] border-dashed border-border px-3 py-2 text-xs font-bold text-muted hover:border-dark hover:text-ink dark:hover:border-lime'
          >
            + Add a number
          </button>
        </div>
      )}
    </div>
  )
}
