import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import CodeInput from './CodeInput'
import ErrorText from './ErrorText'
import {
  CODE_LENGTH,
  EMAIL_REGEX,
  INPUT_CLASS,
  PILL_BUTTON_CLASS,
  STEP_PANEL_CLASS,
  primaryButtonClass,
} from './utils'

interface CodeStepProps {
  destination: string
  code: string
  resendCooldown: number
  resending: boolean
  emailSent: boolean
  sendingEmail: boolean
  submitting: boolean
  errorMsg: string | null
  onCodeChange: (code: string) => void
  onResend: () => void
  onSendEmail: (email: string) => void
  onConfirm: () => void
  onBack: () => void
}

export default function CodeStep({
  destination,
  code,
  resendCooldown,
  resending,
  emailSent,
  sendingEmail,
  submitting,
  errorMsg,
  onCodeChange,
  onResend,
  onSendEmail,
  onConfirm,
  onBack,
}: CodeStepProps) {
  const [emailFallbackOpen, setEmailFallbackOpen] = useState(false)
  const [email, setEmail] = useState('')

  const resendDisabled = resending || resendCooldown > 0
  const canSendEmail = EMAIL_REGEX.test(email.trim()) && !sendingEmail
  const canConfirm = code.trim().length === CODE_LENGTH && !submitting

  return (
    <div className={STEP_PANEL_CLASS}>
      <div className='mb-3 flex items-center justify-between border-b border-border pb-2.5'>
        <span className='text-[11px] font-bold tracking-widest text-muted uppercase'>
          Verify your number
        </span>
        <button type='button' onClick={onBack} className={PILL_BUTTON_CLASS}>
          Wrong number?
        </button>
      </div>

      <p className='mb-3 text-center text-xs leading-snug text-muted'>
        Enter the {CODE_LENGTH}-digit code sent to{' '}
        <strong className='font-semibold text-foreground'>{destination}</strong>
      </p>

      <CodeInput value={code} onChange={onCodeChange} />

      <div className='mb-3 flex flex-col items-center gap-1.5 text-xs'>
        <div className='text-muted'>
          {resendCooldown > 0 || resending ? (
            resending ? 'Resending…' : `Resend code in ${resendCooldown}s`
          ) : (
            <>
              Didn&apos;t get it?{' '}
              <button
                type='button'
                onClick={onResend}
                disabled={resendDisabled}
                className='link-action font-semibold text-dark dark:text-lime'
              >
                Resend code
              </button>
            </>
          )}
        </div>

        {emailSent ? (
          <div className='font-semibold text-success'>
            Code sent — check your email.
          </div>
        ) : (
          !emailFallbackOpen && (
            <button
              type='button'
              onClick={() => setEmailFallbackOpen(true)}
              className='link-action flex items-center gap-1 font-semibold text-dark dark:text-lime'
            >
              <HugeiconsIcon icon={Mail01Icon} size={13} />
              Still no code? Request it by email
            </button>
          )
        )}
      </div>

      {!emailSent && emailFallbackOpen && (
        <div className='animate-slide-up mb-3 rounded-xl border border-border bg-surface px-3 py-2.5'>
          <label
            htmlFor='code-email'
            className='mb-1.5 block text-xs font-semibold text-muted'
          >
            We&apos;ll send the code to this email instead
          </label>
          <div className='flex gap-2'>
            <input
              id='code-email'
              type='email'
              autoComplete='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${INPUT_CLASS} border-border`}
            />
            <button
              type='button'
              onClick={() => onSendEmail(email.trim())}
              disabled={!canSendEmail}
              className={`h-11 shrink-0 rounded-xl px-4 text-sm font-bold transition-[transform,background-color] ${
                canSendEmail
                  ? 'btn-lift bg-lime text-lime-ink hover:bg-[#cfff3d]'
                  : 'cursor-not-allowed bg-border text-neutral-10'
              }`}
            >
              {sendingEmail ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      )}

      <button
        type='button'
        onClick={onConfirm}
        disabled={!canConfirm}
        className={primaryButtonClass(canConfirm)}
      >
        {submitting
          ? 'Verifying…'
          : code.length === CODE_LENGTH
            ? 'Verify & Lock In'
            : 'Enter the code'}
      </button>

      {errorMsg && <ErrorText className='mt-2.5'>{errorMsg}</ErrorText>}
    </div>
  )
}
