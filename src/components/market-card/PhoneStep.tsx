import { useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { LockIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import type { PredictionSide } from '../../utils/types'
import type { VerifiedNumber } from '../../redux/campaignSlice'
import { trackEvent } from '../../utils/constants'
import NumberSwitcher from './NumberSwitcher'
import SelectionChoice from './SelectionChoice'
import ErrorText from './ErrorText'
import {
  INPUT_CLASS,
  NG_PHONE_REGEX,
  PILL_BUTTON_CLASS,
  STEP_PANEL_CLASS,
  formatPhoneDisplay,
  primaryButtonClass,
} from './utils'

interface PhoneStepProps {
  pickedSide: PredictionSide
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
  const isValidPhone = NG_PHONE_REGEX.test(phone)
  const showPhoneError = phone.length === 10 && !isValidPhone
  const canSubmit = showPhoneInput ? isValidPhone : true

  // Fires each time the "Enter a valid Nigerian mobile number" message appears.
  useEffect(() => {
    if (showPhoneError) {
      trackEvent({
        event: 'form_validation_error',
        form_name: 'waitlist',
        form_step: 'phone',
        error_type: 'invalid_phone',
      })
    }
  }, [showPhoneError])

  function handlePhoneChange(raw: string) {
    onPhoneChange(raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10))
  }

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
        <>
          <label
            htmlFor='prediction-phone'
            className='mb-1.5 block text-xs font-semibold text-muted'
          >
            {returning ? 'Mobile number to predict as' : 'Your mobile number'}
          </label>
          <div className='mb-2 flex gap-2'>
            <div className='flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] border-border bg-surface px-3 text-xs font-semibold whitespace-nowrap text-foreground'>
              <HugeiconsIcon icon={SmartPhone01Icon} size={15} className='text-muted' />
              NG +234
            </div>
            <input
              id='prediction-phone'
              type='tel'
              inputMode='numeric'
              autoComplete='tel-national'
              placeholder='801 234 5678'
              value={formatPhoneDisplay(phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              aria-invalid={showPhoneError}
              className={`${INPUT_CLASS} ${
                showPhoneError ? 'border-error' : 'border-border'
              }`}
            />
          </div>
          {showPhoneError && (
            <ErrorText className='mb-2'>
              Enter a valid Nigerian mobile number.
            </ErrorText>
          )}
        </>
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
        Free · One-time verification
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
