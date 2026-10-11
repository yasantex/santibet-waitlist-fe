export type Stage = 'pick' | 'phone' | 'code' | 'done'

export const STAGE_ORDER: Stage[] = ['pick', 'phone', 'code', 'done']
export const CODE_LENGTH = 6
// Nigerian mobile numbers: 10 digits after the leading 0, starting 7/8/9.
export const NG_PHONE_REGEX = /^[789]\d{9}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const RESEND_COOLDOWN_SECONDS = 30

export const BACK_LINK_CLASS =
  'block w-full cursor-pointer text-center text-xs font-bold text-muted transition-colors hover:text-[var(--foreground)] hover:underline hover:decoration-lime hover:decoration-2 hover:underline-offset-4 active:opacity-70'

export function primaryButtonClass(enabled: boolean) {
  return `w-full rounded-xl px-6 py-3.75 font-black transition-[filter,transform,box-shadow,background-color] ${
    enabled
      ? 'btn-3d [--btn-depth:5px] bg-lime text-lime-ink'
      : 'cursor-not-allowed bg-border text-neutral-10'
  }`
}

export function formatPhoneDisplay(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
    .filter(Boolean)
    .join(' ')
}

/** 8012341234 → 080••••1234 */
export function maskPhone(digits: string) {
  return `0${digits.slice(0, 2)}••••${digits.slice(-4)}`
}
