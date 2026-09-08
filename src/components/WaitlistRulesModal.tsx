'use client'

import Modal from './Modal'

type WaitlistRulesModalProps = {
  open: boolean
  onClose: () => void
}

type Section = {
  title: string
  items: string[]
}

const SECTIONS: Section[] = [
  {
    title: 'How to Play',
    items: [
      'One Daily Call: Tap YES or NO on the daily gist before the timer runs out.',
      'Zero Deposit: No registration, no funding, and absolutely no payments required during pre-launch.',
      'Earn Points: Every correct call moves you up the Founder Leaderboard and stacks extra draw entries.',
    ],
  },
  {
    title: 'The Rewards',
    items: [
      'Daily & Weekly Payouts: Win up to ₦5,000 in cash or airtime even before the official launch.',
      'Launch Day Draw: Every active daily call serves as a ticket toward the ₦1,000,000 Grand Prize on 1 November 2026.',
    ],
  },
  {
    title: 'Responsible Predicting',
    items: [
      'Just for Fun: Pre-launch predictions are 100% free and meant to test your crowd instincts.',
      'Fair Play: One account per person. Smart tracking is active to keep the leaderboard fair for all Founders.',
      'No Guarantees: Payout values follow strict tier limits. Live sports and market outcomes resolve conclusively based on official final data feeds.',
    ],
  },
]

export default function WaitlistRulesModal({
  open,
  onClose,
}: WaitlistRulesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title='SantiBet Waitlist & Prediction Rules'
      footer={
        <button
          type='button'
          onClick={onClose}
          className='w-full cursor-pointer rounded-xl bg-lime px-6 py-3.75 font-black text-lime-ink shadow-[0_5px_0_#8FC200] dark:text-[#10230a]!'
        >
          Got it, let&apos;s predict!
        </button>
      }
    >
      <div className='flex flex-col gap-5 text-sm leading-6 text-muted'>
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h4 className='mb-2 font-display text-base font-black text-ink'>
              {section.title}
            </h4>
            <ul className='list-disc space-y-1.5 pl-5'>
              {section.items.map((item) => {
                const [label, ...rest] = item.split(': ')
                const description = rest.join(': ')
                return (
                  <li key={label}>
                    <strong className='font-bold text-ink'>{label}:</strong>{' '}
                    {description}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  )
}
