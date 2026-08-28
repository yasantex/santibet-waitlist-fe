import type { Money } from '../types/campaign'

/** API amounts are in minor units (e.g. kobo) — divide by 100 to get the display value. */
export function formatMoney(money: Money) {
  const prefix = money.currency === 'NGN' ? '₦' : `${money.currency} `
  return `${prefix}${(Number(money.amount) / 100).toLocaleString()}`
}
