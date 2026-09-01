export type Currency = 'NGN' | 'USD' | 'USDC' | 'USDT'
export type PrizeKind = 'AIRTIME' | 'CASH' | 'BONUS_CREDIT'
export type CampaignPhase = 'UPCOMING' | 'ACTIVE' | 'FINISHED'

export interface Money {
  amount: string
  currency: Currency
}

export interface Campaign {
  slug: string
  name: string
  description: string | null
  timeZone: string
  startsOn: string
  endsOn: string
  launchAt: string | null
  status: 'RUNNING' | 'ENDED'
  today: string
  phase: CampaignPhase
  dayNumber: number | null
  totalDays: number
  daysUntilStart: number | null
  daysRemaining: number | null
  participantCount: number
}

export interface CampaignStats {
  participantCount: number
  totalPredictions: number
  winnersPaid: number
  dailyPrizePool: Money[]
  today: {
    campaignDay: number
    predictions: number
    yesPercent: number | null
  } | null
}

export interface ScoringRules {
  pointsPerCorrectPrediction: number
  pointsPerReferral: number
  pointsPerReferee: number
}

export interface StreakBonus {
  streakLength: number
  bonusPoints: number
}

export interface CampaignLevel {
  key: string
  name: string
  minPoints: number
}

export interface ReferralMilestone {
  friendCount: number
  bonusPoints: number
  bonusDrawEntries: number
  reward: Money | null
  rewardKind: PrizeKind | null
}

export interface PrizeTierRule {
  place: number
  name: string
  winnerCount: number
  amount: Money
  kind: PrizeKind
  maxPayout: Money | null
}

export type PrizePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'LAUNCH'

export interface PrizePeriodRules {
  period: PrizePeriod
  tiers: PrizeTierRule[]
}

export interface CampaignRules {
  scoring: ScoringRules
  streakBonuses: StreakBonus[]
  levels: CampaignLevel[]
  referralMilestones: ReferralMilestone[]
  prizes: PrizePeriodRules[]
}

export type ActivityItem =
  | { type: 'JOINED'; player: string; at: string }
  | { type: 'PREDICTED'; player: string; at: string; campaignDay: number }
  | {
      type: 'CLIMBED'
      player: string
      at: string
      rank: number
      previousRank: number
    }
  | {
      type: 'WON'
      player: string
      at: string
      prizeName: string
      amount: Money
    }

export interface TodayQuestion {
  campaignDay: number
  text: string
  resolutionSourceUrl: string | null
  resolutionCriteria: string | null
  nonce: string
  contentHash: string
  opensAt: string
  closesAt: string
}

export interface PreviousQuestion extends TodayQuestion {
  outcome: 'YES' | 'NO' | null
  evidenceUrl: string | null
  resolvedAt: string | null
  status: 'CLOSED' | 'RESOLVED' | 'VOID'
  correctedAt: string | null
  correctionNote: string | null
  predictions: number
  correct: number
  payout: number | null
}

export interface LeaderboardEntry {
  participantNumber: number
  points: number
  rank: number | null
  currentStreak: number
  longestStreak: number
  level: string | null
}

export interface ReferralStanding {
  friends: number
  nextMilestone: { friendCount: number; friendsToGo: number } | null
}

export interface ParticipantStanding {
  participantNumber: number
  referralCode: string
  phoneVerified: boolean
  points: number
  rank: number | null
  level: string | null
  currentStreak: number
  longestStreak: number
  isCustomer: boolean
  joinedAt: string
  referrals: ReferralStanding
  deviceToken?: string
}

export interface SendVerificationResult {
  destination: string
  participantNumber: number
}

export interface PredictionResult {
  status: 'COMPLETE' | 'AWAITING_CODE'
  campaignDay: number
  choice: 'YES' | 'NO'
  destination?: string
}

export interface Winning {
  id: string
  campaignSlug: string
  campaignName: string
  period: PrizePeriod
  periodStart: string
  periodEnd: string
  drawnAt: string | null
  place: number
  prizeName: string
  amount: string
  currency: Currency
  kind: PrizeKind
  status: 'PENDING' | 'SENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  paidAt: string | null
  claimStartedAt: string | null
  claimable: boolean
}
