import { useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { trackEvent } from '../../utils/constants'
import ErrorText from './ErrorText'
import { INPUT_CLASS, NG_PHONE_REGEX, formatPhoneDisplay } from './utils'

interface PhoneFieldProps {
  id: string
  label: string
  /** National digits without the leading 0. */
  value: string
  onChange: (digits: string) => void
  /** Where the field sits, for the validation-error event. */
  formStep: 'phone' | 'join'
  autoFocus?: boolean
  onEnter?: () => void
}

/** "NG +234" mobile number input with Nigerian-number validation. */
export default function PhoneField({
  id,
  label,
  value,
  onChange,
  formStep,
  autoFocus,
  onEnter,
}: PhoneFieldProps) {
  const showError = value.length === 10 && !NG_PHONE_REGEX.test(value)

  // Fires each time the "Enter a valid Nigerian mobile number" message appears.
  useEffect(() => {
    if (showError) {
      trackEvent({
        event: 'form_validation_error',
        form_name: 'waitlist',
        form_step: formStep,
        error_type: 'invalid_phone',
      })
    }
  }, [showError, formStep])

  return (
    <>
      <label htmlFor={id} className='mb-1.5 block text-xs font-semibold text-muted'>
        {label}
      </label>
      <div className='mb-2 flex gap-2'>
        <div className='flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] border-border bg-surface px-3 text-xs font-semibold whitespace-nowrap text-foreground'>
          <HugeiconsIcon icon={SmartPhone01Icon} size={15} className='text-muted' />
          NG +234
        </div>
        <input
          id={id}
          type='tel'
          inputMode='numeric'
          autoComplete='tel-national'
          autoFocus={autoFocus}
          placeholder='801 234 5678'
          value={formatPhoneDisplay(value)}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter?.()
          }}
          aria-invalid={showError}
          className={`${INPUT_CLASS} ${showError ? 'border-error' : 'border-border'}`}
        />
      </div>
      {showError && (
        <ErrorText className='mb-2'>Enter a valid Nigerian mobile number.</ErrorText>
      )}
    </>
  )
}
