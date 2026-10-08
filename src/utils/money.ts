import type { Money } from '../types/campaign'

/** API amounts are in minor units (e.g. kobo) — divide by 100 to get the display value. */
export function formatMoney(money: Money, { compact = false } = {}) {
  const prefix = money.currency === 'NGN' ? '₦' : `${money.currency} `
  const major = Number(money.amount) / 100
  return `${prefix}${
    compact
      ? new Intl.NumberFormat('en', { notation: 'compact' }).format(major)
      : major.toLocaleString()
  }`
}
