import { HugeiconsIcon } from '@hugeicons/react'
import { LockIcon } from '@hugeicons/core-free-icons'
import type { PredictionSide } from '../../utils/types'
import type { VerifiedNumber } from '../../redux/campaignSlice'
import NumberSwitcher from './NumberSwitcher'
import PhoneField from './PhoneField'
import SelectionChoice from './SelectionChoice'
import ErrorText from './ErrorText'
import {
  NG_PHONE_REGEX,
  PILL_BUTTON_CLASS,
  STEP_PANEL_CLASS,
  primaryButtonClass,
} from './utils'

interface PhoneStepProps {
  pickedSide: PredictionSide
  /** False when the campaign asks nobody for a code. */
  requiresCode: boolean
  /** Set for a returning player: the masked number they predict as. */
  predictingAsLabel: string | null
  otherNumbers: VerifiedNumber[]
  /** A returning player typing a number other than their saved one. */
  enteringNumber: boolean
  switcherOpen: boolean
  phone: string
  submitting: boolean
  errorMsg: string | null
  onPhoneChange: (digits: string) => void
  onToggleSwitcher: () => void
  onSwitch: (phone: string) => void
  onAddNumber: () => void
  onCancelAddNumber: () => void
  onSubmit: () => void
  onOpenRules: () => void
  onBack: () => void
}

export default function PhoneStep({
  pickedSide,
  requiresCode,
  predictingAsLabel,
  otherNumbers,
  enteringNumber,
  switcherOpen,
  phone,
  submitting,
  errorMsg,
  onPhoneChange,
  onToggleSwitcher,
  onSwitch,
  onAddNumber,
  onCancelAddNumber,
  onSubmit,
  onOpenRules,
  onBack,
}: PhoneStepProps) {
  const returning = predictingAsLabel !== null
  const showPhoneInput = !returning || enteringNumber
  const canSubmit = showPhoneInput ? NG_PHONE_REGEX.test(phone) : true

  return (
    <div className={STEP_PANEL_CLASS}>
      <div className='mb-3 flex items-center justify-between border-b border-border pb-2.5'>
        <span className='text-[11px] font-bold tracking-widest text-muted uppercase'>
          Your Selection
        </span>
        <button type='button' onClick={onBack} className={PILL_BUTTON_CLASS}>
          Change
        </button>
      </div>

      <SelectionChoice side={pickedSide} />

      <p className='mt-2.5 mb-3 text-center text-xs leading-snug text-muted'>
        {showPhoneInput
          ? 'Nice pick. Save your prediction & join the waitlist.'
          : 'Nice pick. Tap confirm to lock it in.'}
      </p>

      {returning && !enteringNumber && (
        <NumberSwitcher
          predictingAsLabel={predictingAsLabel}
          otherNumbers={otherNumbers}
          open={switcherOpen}
          onToggle={onToggleSwitcher}
          onSwitch={onSwitch}
          onAddNumber={onAddNumber}
        />
      )}

      {returning && enteringNumber && (
        <button
          type='button'
          onClick={onCancelAddNumber}
          className='link-action mb-3 block text-left text-xs font-semibold text-dark dark:text-lime'
        >
          ← Predict as {predictingAsLabel} instead
        </button>
      )}

      {showPhoneInput && (
        <PhoneField
          id='prediction-phone'
          label={returning ? 'Mobile number to predict as' : 'Your mobile number'}
          value={phone}
          onChange={onPhoneChange}
          formStep='phone'
          onEnter={canSubmit && !submitting ? onSubmit : undefined}
        />
      )}

      <button
        type='button'
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className={primaryButtonClass(canSubmit && !submitting)}
      >
        {submitting
          ? 'Submitting…'
          : showPhoneInput
            ? phone
              ? 'Save Prediction'
              : 'Enter your phone number'
            : 'Confirm prediction'}
      </button>

      {errorMsg && <ErrorText className='mt-2.5'>{errorMsg}</ErrorText>}

      <div className='mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-muted'>
        <HugeiconsIcon icon={LockIcon} size={12} />
        {requiresCode ? 'Free · One-time verification' : 'Free · No deposit, no payment'}
      </div>
      <div className='mt-1.5 text-center text-[11px] text-muted'>
        By continuing, you agree to our{' '}
        <button
          type='button'
          onClick={onOpenRules}
          className='link-action font-semibold text-dark dark:text-lime'
        >
          Waitlist &amp; Prediction Rules
        </button>
        .
      </div>
    </div>
  )
}
