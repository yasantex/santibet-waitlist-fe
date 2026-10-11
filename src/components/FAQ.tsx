'use client'

import { useState } from 'react'
import SectionHead from './SectionHead'
import WaitlistRulesModal from './WaitlistRulesModal'
import { trackEvent } from '../utils/constants'

type Faq = { id: string; q: string; a: React.ReactNode }

export default function FAQ() {
  const [rulesOpen, setRulesOpen] = useState(false)

  const faqs: Faq[] = [
    {
      id: 'free',
      q: 'Is it free to join?',
      a: 'Yes. The pre-launch predictions are completely free. No deposit or payment is required.',
    },
    {
      id: 'points',
      q: 'How do I earn Founder Points?',
      a: 'Make the daily prediction before the timer ends. Correct predictions earn Founder Points and can improve your Founder ranking.',
    },
    {
      id: 'rewards',
      q: 'Can I earn real rewards before launch?',
      a: 'Yes. Eligible daily and weekly rewards include airtime and other prizes. All rewards are subject to the applicable rules and eligibility requirements.',
    },
    {
      id: 'draw',
      q: 'How does the launch-day prize draw work?',
      a: (
        <>
          Eligible correct predictions can qualify you for the launch-day prize
          draw. The draw has multiple prizes, including the grand prize. See the{' '}
          <button
            type='button'
            onClick={() => {
              setRulesOpen(true)
              trackEvent({ event: 'rules_opened', cta_name: 'faq_rules_link' })
            }}
            className='link-action font-bold text-dark dark:text-lime'
          >
            Prediction Rules
          </button>{' '}
          for the full eligibility and selection criteria.
        </>
      ),
    },
    {
      id: 'referrals',
      q: 'How do referrals work?',
      a: 'Share your unique referral link. When a referred friend joins and makes their first prediction, both of you can earn Founder Points and unlock additional referral rewards.',
    },
  ]
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    const opening = openId !== id
    setOpenId(opening ? id : null)
    trackEvent({ event: 'faq_interaction', faq_id: id, faq_action: opening ? 'open' : 'close' })
  }

  return (
    <section id='faq' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='FAQ'
          title={
            <>
              Got questions?
              <br />
              We&apos;ve got answers.
            </>
          }
          subtitle='Everything you need to know about the waitlist, points and prizes.'
        />
        <div className='mx-auto flex max-w-180 flex-col gap-2.5'>
          {faqs.map((faq) => {
            const open = openId === faq.id
            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${
                  open ? 'border-dark dark:border-lime' : 'border-border'
                }`}
              >
                <h3>
                  <button
                    type='button'
                    id={`faq-q-${faq.id}`}
                    aria-expanded={open}
                    aria-controls={`faq-a-${faq.id}`}
                    onClick={() => toggle(faq.id)}
                    className='group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2 sm:px-6'
                  >
                    <span className='font-display text-base font-black text-ink sm:text-[17px]'>
                      {faq.q}
                    </span>
                    <span
                      aria-hidden='true'
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg font-black transition-[transform,background-color] duration-200 ${
                        open
                          ? 'rotate-45 bg-lime text-lime-ink'
                          : 'bg-surface-2 text-dark group-hover:bg-lime group-hover:text-lime-ink dark:text-lime'
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${faq.id}`}
                  role='region'
                  aria-labelledby={`faq-q-${faq.id}`}
                  inert={!open}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className='overflow-hidden'>
                    <p className='px-5 pb-5 text-[15px] leading-relaxed text-muted sm:px-6'>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <WaitlistRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </section>
  )
}
