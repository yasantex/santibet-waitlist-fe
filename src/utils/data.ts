import type { FounderBenefit, JourneyStep, ReferStep } from './types'

export const journeySteps: JourneyStep[] = [
  { when: 'Today', what: 'Win Airtime Daily', icon: 'sunrise' },
  { when: 'This week', what: 'Win Money', icon: 'coin' },
  { when: 'Every correct prediction', what: 'Bank Founder points', icon: 'target' },
  {
    when: 'Launch day',
    what: 'Chase ₦1,000,000',
    icon: 'trophy',
    final: true,
  },
  { when: 'After launch', what: 'Keep Founder perks for life', icon: 'crown' },
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
  { icon: 'wallet', text: 'A bigger match on your first deposit' },
  { icon: 'confetti', text: 'First access to every launch-week drop' },
]
