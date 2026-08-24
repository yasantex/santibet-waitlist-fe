import type {
  FounderBenefit,
  FounderLevel,
  JourneyStep,
  ReferStep,
} from './types'

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
