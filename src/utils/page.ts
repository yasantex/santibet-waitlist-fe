export function scrollMainToTop() {
  document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Scrolls today's question into view and flashes a lime ring around it. */
export function focusQuestionCard() {
  const card = document.getElementById('market')
  if (!card) return
  card.scrollIntoView({ behavior: 'smooth', block: 'center' })
  card.animate(
    [
      { boxShadow: '0 0 0 3px var(--color-lime)' },
      { boxShadow: '0 0 0 3px var(--color-lime)', offset: 0.6 },
      { boxShadow: '0 0 0 0 transparent' },
    ],
    { duration: 1500, easing: 'ease-out' },
  )
}

export function referralLink(referralCode: string) {
  return typeof window === 'undefined'
    ? ''
    : `${window.location.origin}/?ref=${referralCode}`
}

/** The ?ref= code this visit arrived with, if any. */
export function readReferralCode() {
  return typeof window === 'undefined'
    ? undefined
    : (new URLSearchParams(window.location.search).get('ref') ?? undefined)
}
