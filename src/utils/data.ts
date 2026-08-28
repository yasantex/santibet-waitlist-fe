import type { FounderBenefit, JourneyStep, ReferStep } from './types'

export const journeySteps: JourneyStep[] = [
  { when: 'Today', what: 'Pocket some airtime' },
  { when: 'This week', what: 'Stack real cash' },
  { when: 'Every correct call', what: 'Bank Founder points' },
  { when: 'Launch day', what: 'Chase ₦1,000,000', final: true },
  { when: 'After launch', what: 'Keep Founder perks for life' },
]

export const referSteps: ReferStep[] = [
  {
    num: '01',
    what: 'Drop your link',
    sub: "It's generated the second you make your first prediction.",
  },
  {
    num: '02',
    what: 'They make their call',
    sub: "One YES or NO with their number, and it's counted.",
  },
  {
    num: '03',
    what: 'You both cash in',
    sub: '+5 Founder points each, plus a jump up the leaderboard.',
  },
]

export const founderBenefits: FounderBenefit[] = [
  { icon: 'badge', text: 'A Founder Badge that never expires' },
  { icon: 'rocket', text: 'Skip the queue at public launch' },
  { icon: 'gift', text: 'A welcome bonus stacked on top of the standard one' },
  { icon: 'ticket', text: 'Free credits to make your first calls with' },
  { icon: 'wallet', text: 'A bigger match on your first deposit' },
  { icon: 'confetti', text: 'First access to every launch-week drop' },
]
