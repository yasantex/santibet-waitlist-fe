import { sendGTMEvent } from '@next/third-parties/google'
import { AxiosError } from 'axios'
import type { Money } from '../types/campaign'
import type { FounderBenefit, JourneyStep, ReferStep } from './types'

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const SUPPORT_EMAIL = 'support@santibet.com'

export type SocialName = 'instagram' | 'x' | 'tiktok' | 'facebook' | 'linkedin'

export const socialLinks: { name: SocialName; label: string; handle: string; href: string }[] = [
  { name: 'instagram', label: 'Instagram', handle: '@santibetng', href: 'https://www.instagram.com/santibetng' },
  { name: 'x', label: 'X', handle: '@santibetng', href: 'https://x.com/santibetng' },
  { name: 'tiktok', label: 'TikTok', handle: '@santibetng', href: 'https://www.tiktok.com/@santibetng' },
  { name: 'facebook', label: 'Facebook', handle: 'Santibetng', href: 'https://www.facebook.com/santibetng' },
  { name: 'linkedin', label: 'LinkedIn', handle: 'Santibet', href: 'https://www.linkedin.com/company/santibet/' },
]

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

// Events pushed to the GTM dataLayer, following BE's "GA4 Event Tracking
// Specification". Each name needs a matching Custom Event trigger + GA4 Event
// tag in the GTM container to reach GA4.
//
// Not sent from here, by design:
// - page_view, scroll, outbound clicks, page_location/page_title and utm_*:
//   collected by the GA4 Google tag + enhanced measurement in GTM.
// - contact_form_*: the page has no contact form, only email and social links.
//
// Never put personal data (phone, email, codes, referral codes) or raw API
// error messages in a payload — the API's messages can echo user input.

type FormName = 'waitlist'
type FormStep = 'pick' | 'phone' | 'code'
type VerificationMethod = 'phone' | 'email'
type Side = 'yes' | 'no'
type ErrorInfo = { error_type: string; error_code: string }

type AnalyticsEvent =
  // 1. Traffic & page engagement
  | { event: 'cta_click'; cta_name: string }
  | { event: 'faq_interaction'; faq_id: string; faq_action: 'open' | 'close' }
  | { event: 'contact_us_click'; cta_name: string }
  | { event: 'social_link_click'; social_platform: SocialName; cta_name: string }
  // 2. Waitlist registration funnel
  | { event: 'waitlist_form_start'; form_name: FormName; form_step: 'pick'; side: Side; returning_player: boolean }
  | { event: 'waitlist_form_submit'; form_name: FormName; form_step: 'phone'; returning_player: boolean }
  | { event: 'waitlist_signup_success'; form_name: FormName; side?: Side; referred: boolean }
  | ({ event: 'waitlist_signup_failed'; form_name: FormName; form_step: FormStep } & ErrorInfo)
  | { event: 'verification_started'; form_name: FormName; verification_method: VerificationMethod }
  | { event: 'verification_completed'; form_name: FormName; verification_method: VerificationMethod }
  | ({ event: 'verification_failed'; form_name: FormName; verification_method: VerificationMethod } & ErrorInfo)
  // 4. Form & technical errors
  | { event: 'form_validation_error'; form_name: FormName; form_step: FormStep; error_type: string }
  | ({ event: 'api_request_failed'; form_name: FormName; form_step: FormStep; request: string } & ErrorInfo)
  | ({ event: 'page_load_error' } & ErrorInfo)
  // SantiBet extras (not in the spec, kept for product insight)
  | { event: 'prediction_confirmed'; side?: Side }
  | { event: 'verification_code_resent'; verification_method: VerificationMethod }
  | { event: 'referral_link_copied'; cta_name: string }
  | { event: 'referral_share_click'; cta_name: string; share_channel: 'whatsapp' | 'native' }
  | { event: 'rules_opened'; cta_name: string }
  | { event: 'founder_tier_opened'; tier: string }

export function trackEvent(payload: AnalyticsEvent) {
  // Without a container ID GTM never loads, so there is no dataLayer to push to.
  if (!process.env.NEXT_PUBLIC_GTM_ID) return
  sendGTMEvent(payload)
}

/**
 * Non-sensitive error category + code for a failed API call: the HTTP status,
 * or the API's machine-readable `code` when it sends one. Never the message.
 */
export function errorInfo(error: unknown): ErrorInfo {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return { error_type: 'network', error_code: error.code ?? 'NETWORK_ERROR' }
    }
    const data = error.response.data as { code?: unknown } | undefined
    const apiCode =
      typeof data?.code === 'string' && /^[A-Z0-9_]{1,64}$/.test(data.code)
        ? data.code
        : null
    return {
      error_type: error.response.status >= 500 ? 'server' : 'client',
      error_code: apiCode ?? String(error.response.status),
    }
  }
  return { error_type: 'unknown', error_code: 'UNKNOWN' }
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

export const journeySteps: JourneyStep[] = [
  { when: 'Today', what: 'Earn daily airtime rewards', icon: 'sunrise' },
  { when: 'This week', what: 'Unlock weekly rewards', icon: 'coin' },
  { when: 'Every prediction', what: 'Earn Founder Points', icon: 'target' },
  {
    when: 'Launch day',
    what: 'Qualify for the ₦1,000,000 prize draw',
    icon: 'trophy',
    final: true,
  },
  { when: 'After launch', what: 'Keep your Founder perks', icon: 'crown' },
]

export const referSteps: ReferStep[] = [
  {
    num: '01',
    what: 'Drop your link',
    sub: "Your unique referral link is generated when you make your first prediction.",
  },
  {
    num: '02',
    what: 'They make a prediction',
    sub: "They make their first YES or NO prediction, and the referral counts.",
  },
  {
    num: '03',
    what: 'You both earn points',
    sub: '+5 Founder Points each, helping you climb the leaderboard.',
  },
]

export const founderBenefits: FounderBenefit[] = [
  { icon: 'badge', text: 'A Founder Badge that never expires' },
  { icon: 'rocket', text: 'Skip the queue at public launch' },
  { icon: 'gift', text: 'A welcome bonus stacked on top of the standard one' },
  { icon: 'ticket', text: 'Free credits to make your first prediction with' },
  { icon: 'wallet', text: 'A Founder-only deposit match when deposits open' },
  { icon: 'confetti', text: 'First access to every launch-week drop' },
]
