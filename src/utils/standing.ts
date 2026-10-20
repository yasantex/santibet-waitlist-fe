import type { ParticipantStanding, PlayerCard } from '../types/campaign'

/**
 * A standing built from the founder card on a /join or prediction reply, so the page can show
 * the player straight away. Fields the card doesn't carry are placeholders until /me loads.
 */
export function standingFromCard(card: PlayerCard): ParticipantStanding {
  return {
    participantNumber: card.participantNumber,
    referralCode: card.referralCode,
    rank: card.rank ?? null,
    points: card.points ?? 0,
    level: card.level ?? null,
    currentStreak: card.currentStreak ?? 0,
    longestStreak: card.longestStreak ?? 0,
    hasPhone: card.hasPhone,
    deviceToken: card.deviceToken,
    phoneVerified: false,
    isCustomer: false,
    joinedAt: '',
    referrals: { friends: 0, nextMilestone: null },
  }
}
