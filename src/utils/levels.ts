import type { CampaignLevel } from '../types/campaign'

export function sortLevels(levels: CampaignLevel[] | undefined) {
  return (levels ?? []).slice().sort((a, b) => a.minPoints - b.minPoints)
}

/** Display name for a level key, falling back to the key itself. */
export function levelName(levels: CampaignLevel[], key: string | null) {
  if (!key) return null
  const level = levels.find((l) => l.key === key || l.name === key)
  return level?.name ?? key.charAt(0).toUpperCase() + key.slice(1)
}

/** Where `points` sits on the ladder: the tier reached, the next one, and the % of the way there. */
export function levelProgress(sortedLevels: CampaignLevel[], points: number) {
  let index = -1
  sortedLevels.forEach((l, i) => {
    if (points >= l.minPoints) index = i
  })
  const current = sortedLevels[index] ?? null
  const next = sortedLevels[index + 1] ?? null
  const from = current?.minPoints ?? 0
  const percent = next
    ? Math.min(100, Math.max(0, ((points - from) / (next.minPoints - from)) * 100))
    : 100
  return { current, next, percent }
}
