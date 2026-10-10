import { useState } from 'react'
import CodeInput from './CodeInput'
import {
  BACK_LINK_CLASS,
  CODE_LENGTH,
  EMAIL_REGEX,
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
    <div className='px-7.5 pt-5 pb-6.5'>
      <div className='mb-4 flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3'>
        <span className='text-[12.5px] font-semibold text-ink'>
          Code sent to <strong>{destination}</strong>
        </span>
      </div>

      <div className='mb-2 text-xs font-bold text-muted'>
        Enter the {CODE_LENGTH}-digit code
      </div>
      <CodeInput value={code} onChange={onCodeChange} />

      <button
        type='button'
        onClick={onResend}
        disabled={resendDisabled}
        className={`mb-4 text-xs font-bold underline underline-offset-2 transition-opacity ${
          resendDisabled
            ? 'cursor-not-allowed text-neutral-10'
            : 'link-action text-dark dark:text-lime'
        }`}
      >
        {resending
          ? 'Resending…'
          : resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Didn't get it? Resend code"}
      </button>

      {emailSent ? (
        <div className='mb-4 -mt-2 text-xs font-bold text-success'>
          Code sent — check your email.
        </div>
      ) : (
        <div className='mb-4 -mt-2'>
          {!emailFallbackOpen ? (
            <button
              type='button'
              onClick={() => setEmailFallbackOpen(true)}
              className='link-action block text-xs font-bold text-dark dark:text-lime'
            >
              Still no code? Request it by email
            </button>
          ) : (
            <div className='rounded-xl bg-surface-2 px-3.5 py-3'>
              <div className='mb-2 text-xs font-bold text-muted'>
                We&apos;ll send the code to this email instead
              </div>
              <div className='flex flex-wrap gap-2'>
                <input
                  type='email'
                  placeholder='you@example.com'
                  aria-label='Email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='min-w-0 flex-1 rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2 text-[15px] font-semibold text-ink placeholder:text-placeholder placeholder:font-normal'
                />
                <button
                  type='button'
                  onClick={() => onSendEmail(email.trim())}
                  disabled={!canSendEmail}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black transition-[filter,transform,background-color] ${
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
        </div>
      )}

      <button
        type='button'
        onClick={onConfirm}
        disabled={!canConfirm}
        className={primaryButtonClass(canConfirm)}
      >
        {submitting ? 'Verifying…' : 'Confirm & Lock In'}
      </button>

      {errorMsg && (
        <div className='mt-2.5 text-[14px] font-medium text-error'>
          {errorMsg}
        </div>
      )}

      <button type='button' onClick={onBack} className={`mt-3 ${BACK_LINK_CLASS}`}>
        ← Wrong number?
      </button>
    </div>
  )
}
