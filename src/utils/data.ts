import type { FounderBenefit, JourneyStep, ReferStep } from './types'

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
