export type Stage = 'pick' | 'phone' | 'code' | 'done'

export const CODE_LENGTH = 6
// Nigerian mobile numbers: 10 digits after the leading 0, starting 7/8/9.
export const NG_PHONE_REGEX = /^[789]\d{9}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const RESEND_COOLDOWN_SECONDS = 30

export const BACK_LINK_CLASS =
  'block w-full cursor-pointer text-center text-xs font-semibold text-muted transition-colors hover:text-foreground hover:underline hover:decoration-lime hover:decoration-2 hover:underline-offset-4 active:opacity-70'

/** Small bordered pill button, e.g. "Change" in a panel header. */
export const PILL_BUTTON_CLASS =
  'cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-muted hover:text-foreground'

/** Recessed panel the selection, phone and code steps sit in. */
export const STEP_PANEL_CLASS =
  'animate-slide-up rounded-2xl border border-border bg-surface-2 p-3.5 sm:p-4'

export const INPUT_CLASS =
  'h-11 min-w-0 flex-1 rounded-xl border-[1.5px] bg-surface px-3.5 text-[15px] font-medium tracking-wide text-foreground outline-none transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-placeholder focus:border-success focus:shadow-[0_0_0_3px_rgb(22_163_74/0.15)]'

export function primaryButtonClass(enabled: boolean) {
  return `flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold tracking-[0.02em] transition-[transform,box-shadow,background-color] ${
    enabled
      ? 'btn-lift bg-lime text-lime-ink shadow-[0_4px_14px_rgb(191_250_0/0.35)] hover:bg-[#cfff3d]'
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
