export type PredictionSide = "yes" | "no";

export interface MarketMeta {
  alreadyPredicted: string;
  prizePool: string;
}

export interface LeaderboardEntry {
  rank: string;
  name: string;
  points: string;
  top?: boolean;
}

export interface PreviousResult {
  day: string;
  question: string;
  correctAnswer: PredictionSide;
  winningUsers: string;
  dailyWinnersPaid: string;
  totalPredictions: string;
}

export interface JourneyStep {
  when: string;
  what: string;
  final?: boolean;
}

export interface ReferStep {
  num: string;
  what: string;
  sub: string;
}

export interface ReferMilestone {
  count: string;
  reward: string;
}

export interface PrizeTier {
  name: string;
  sub: string;
  winners: string;
  cap: string;
}

export interface FounderLevel {
  icon: string;
  name: string;
  points: string;
}

export interface FounderBenefit {
  icon: string;
  text: string;
}
