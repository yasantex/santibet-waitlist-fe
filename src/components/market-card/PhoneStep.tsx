import { useEffect } from 'react'
import type { PredictionSide } from '../../utils/types'
import type { VerifiedNumber } from '../../redux/campaignSlice'
import { trackEvent } from '../../utils/constants'
import NumberSwitcher from './NumberSwitcher'
import {
  BACK_LINK_CLASS,
  NG_PHONE_REGEX,
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
    <div className='px-7.5 pt-5 pb-6.5'>
      <div className='mb-4 flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3'>
        <span className='shrink-0 rounded-lg bg-lime px-2.5 py-1.5 text-xs font-black text-lime-ink'>
          {pickedSide.toUpperCase()}
        </span>
        <span className='text-[12.5px] font-semibold text-ink'>
          {showPhoneInput
            ? 'Nice pick. One last step to lock it in.'
            : 'Nice pick. Tap confirm to lock it in.'}
        </span>
      </div>

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
          className='link-action mb-4 block text-left text-xs font-bold text-dark dark:text-lime'
        >
          ← Predict as {predictingAsLabel} instead
        </button>
      )}

      {showPhoneInput && (
        <>
          <div className='mb-2 text-xs font-bold text-muted'>
            {returning ? 'Mobile number to predict as' : 'Your mobile number'}
          </div>
          <div className='mb-1.5 flex gap-2'>
            <div className='flex items-center rounded-xl border-[1.5px] border-border bg-surface-2 px-3 py-2 text-sm font-bold text-ink'>
              +234
            </div>
            <input
              type='tel'
              inputMode='numeric'
              placeholder='801 234 5678'
              aria-label='Mobile number'
              value={formatPhoneDisplay(phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`min-w-0 flex-1 rounded-xl border-[1.5px] bg-surface px-3.5 py-2 text-[15px] font-semibold text-ink placeholder:text-placeholder placeholder:font-normal ${
                showPhoneError ? 'border-error' : 'border-border'
              }`}
            />
          </div>
          {showPhoneError && (
            <div className='mb-2 text-[11px] font-bold text-error'>
              Enter a valid Nigerian mobile number.
            </div>
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
            ? 'Submit'
            : 'Confirm prediction'}
      </button>

      {errorMsg && (
        <div className='mt-2.5 text-[14px] font-medium text-error'>
          {errorMsg}
        </div>
      )}

      <div className='mt-3 text-center text-[11px] font-medium text-muted'>
        By continuing, you agree to our{' '}
        <button
          type='button'
          onClick={onOpenRules}
          className='link-action font-bold text-dark dark:text-lime'
        >
          Waitlist &amp; Prediction Rules
        </button>
        .
      </div>

      <button type='button' onClick={onBack} className={`mt-3 ${BACK_LINK_CLASS}`}>
        ← Change selection
      </button>
    </div>
  )
}
