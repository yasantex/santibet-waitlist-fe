import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
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
    <div className='mb-3 rounded-xl border border-border bg-surface px-3 py-2.5'>
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
        <span className='flex items-center gap-1.5 text-xs font-medium text-muted'>
          <HugeiconsIcon icon={SmartPhone01Icon} size={14} />
          Predicting as{' '}
          <strong className='font-semibold text-foreground'>{predictingAsLabel}</strong>
        </span>
        <button
          type='button'
          onClick={canSwitch ? onToggle : onAddNumber}
          className='link-action text-xs font-semibold text-dark dark:text-lime'
        >
          {open ? 'Close' : canSwitch ? 'Switch number' : 'Use another number'}
        </button>
      </div>

      {open && (
        <div className='mt-2.5 flex flex-wrap gap-2 border-t border-dashed border-border pt-2.5'>
          {otherNumbers.map((n) => (
            <button
              key={n.phone}
              type='button'
              onClick={() => onSwitch(n.phone)}
              className='btn-lift rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-dark dark:hover:border-lime'
            >
              {maskPhone(n.phone)}
            </button>
          ))}
          <button
            type='button'
            onClick={onAddNumber}
            className='btn-lift flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted hover:border-dark hover:text-foreground dark:hover:border-lime'
          >
            <HugeiconsIcon icon={Add01Icon} size={13} />
            Add a number
          </button>
        </div>
      )}
    </div>
  )
}
