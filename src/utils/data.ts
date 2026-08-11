import type {
  FounderBenefit,
  FounderLevel,
  JourneyStep,
  LeaderboardEntry,
  PreviousResult,
  PrizeTier,
  ReferMilestone,
  ReferStep,
} from './types'

export const todaysMarket = {
  question: 'Will the Super Eagles win their next AFCON qualifier?',
  yesPercent: 61,
  noPercent: 39,
  alreadyPredicted: '28,413',
  prizePool: '₦125,000',
}

export const previousResult: PreviousResult = {
  day: 'Yesterday',
  question: 'Did Arsenal beat Newcastle?',
  correctAnswer: 'yes',
  winningUsers: '4,218',
  dailyWinnersPaid: '12',
  totalPredictions: '28,111',
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: '01', name: '0803••••291', points: '22 pts', top: true },
  { rank: '02', name: '0906••••045', points: '21 pts', top: true },
  { rank: '03', name: '0701••••812', points: '20 pts', top: true },
  { rank: '04', name: '0815••••330', points: '18 pts' },
  { rank: '05', name: '0912••••567', points: '17 pts' },
]

export const journeySteps: JourneyStep[] = [
  { when: 'Today', what: 'Win airtime' },
  { when: 'This week', what: 'Win cash' },
  { when: 'Every correct prediction', what: 'Earn Founder points' },
  { when: 'Launch day', what: 'Win ₦1,000,000', final: true },
  { when: 'After launch', what: 'Exclusive Founder benefits' },
]

export const referSteps: ReferStep[] = [
  {
    num: '01',
    what: 'Share your link',
    sub: 'Your personal link is generated the moment you make your first prediction.',
  },
  {
    num: '02',
    what: 'Your friend predicts',
    sub: 'As soon as they submit a YES or NO with their mobile number, the referral counts.',
  },
  {
    num: '03',
    what: 'You both earn',
    sub: '+5 Founder points each, plus a jump up the leaderboard.',
  },
]

export const referMilestones: ReferMilestone[] = [
  { count: '3 friends', reward: '₦2,000 airtime + 15 bonus points' },
  { count: '10 friends', reward: '₦10,000 cash + guaranteed Diamond level' },
  {
    count: '25 friends',
    reward: 'Legend status + 5 extra Grand Prize entries',
  },
]

export const prizeTiers: PrizeTier[] = [
  {
    name: '2nd Prize',
    sub: '₦15,000 SantiBet welcome bonus each',
    winners: '5 winners',
    cap: 'Max ₦20,000 payout',
  },
  {
    name: '3rd Prize',
    sub: '₦10,000 SantiBet welcome bonus each',
    winners: '5 winners',
    cap: 'Max ₦12,500 payout',
  },
  {
    name: 'Consolation Prize',
    sub: '₦4,000 SantiBet welcome bonus each',
    winners: '10 winners',
    cap: 'Max ₦7,000 payout',
  },
]

export const founderLevels: FounderLevel[] = [
  { icon: '🥉', name: 'Bronze', points: '5 points' },
  { icon: '🥈', name: 'Silver', points: '15 points' },
  { icon: '🥇', name: 'Gold', points: '30 points' },
  { icon: '💎', name: 'Diamond', points: '60 points' },
  { icon: '👑', name: 'Legend', points: '100 points' },
]

export const founderBenefits: FounderBenefit[] = [
  { icon: '🏅', text: 'Founder Badge on your profile, permanently' },
  { icon: '🚀', text: 'Priority access before public launch' },
  { icon: '🎁', text: 'Exclusive Welcome Bonus' },
  { icon: '🎟', text: 'Free Prediction Credits' },
  { icon: '💰', text: 'Enhanced First Deposit Bonus' },
  { icon: '🎉', text: 'Invitations to exclusive launch promotions' },
]

export const feedNames = [
  'David',
  'Esther',
  'Chidi',
  'Amaka',
  'Tunde',
  'Blessing',
  'Segun',
  'Ngozi',
  'Kelechi',
  'Fatima',
  'Yusuf',
  'Ifeoma',
]
