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
  /** True (the default): predicting is the only way in, so there's no join modal. */
  joinRequiresPrediction?: boolean
  /** The join modal offers email as well as phone. */
  allowEmailJoin?: boolean
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
  pointsForJoining: number
  pointsPerPrediction: number
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
  campaign: {
    name: string
    startsOn: string
    endsOn: string
    launchAt: string | null
    totalDays: number
  }
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

/** Grouped counts the activity stream sends in `toasts` frames. Phones arrive already masked. */
export interface ActivityToasts {
  asOf: string
  joined: { count: number; latest: string | null }
  climbed: { count: number; latest: string | null; rank: number | null }
  won: {
    count: number
    latest: string | null
    prizeName: string | null
    amount: Money | null
  }
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
  payout: { winners: number; paid: number } | null
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
  /** Verified in this campaign; false means a code is still owed here (from /me). */
  verified?: boolean
  /** False for an email joiner who hasn't given a number yet — ask with their first prediction. */
  hasPhone?: boolean
}

export interface SendVerificationResult {
  destination: string
  participantNumber: number
}

/** POST /join. AWAITING_CODE: a code went to `destination`. JOINED: already verified here. */
export interface JoinResult {
  status: 'AWAITING_CODE' | 'JOINED'
  alreadyJoined: boolean
  destination?: string
  participantNumber: number
  referralCode: string
  rank: number | null
}

/** One entry of GET /api/pages. */
export interface ContentPageSummary {
  slug: string
  title: string
  updatedAt: string
}

/** GET /api/pages/:slug — `body` is Markdown. */
export interface ContentPage extends ContentPageSummary {
  body: string
}

export interface PredictionResult {
  status: 'COMPLETE' | 'AWAITING_CODE'
  campaignDay: number
  choice: 'YES' | 'NO'
  destination?: string
  /** Only with COMPLETE. False when the call was placed with the phone number
   *  alone (no device token), so the owner can still replace it today. */
  proven?: boolean
  // Who the call was placed for, on both endings (backend PR #255). Optional until that
  // ships everywhere. `rank` is as of the last rescore and null until first ranked.
  participantNumber?: number
  referralCode?: string
  rank?: number | null
}

/** The founder details the done step shows, from the predict response or a standing. */
export interface PredictionParticipant {
  participantNumber: number
  rank: number | null
  referralCode: string
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
