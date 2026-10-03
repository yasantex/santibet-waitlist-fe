'use client'

import SectionHead from './SectionHead'
import SocialIcon from './SocialIcon'
import { SUPPORT_EMAIL, socialLinks } from '../utils/contact'
import { trackEvent } from '../utils/analytics'

function MailIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <rect x='3' y='5' width='18' height='14' rx='2.5' />
      <path d='m4 7 8 6 8-6' />
    </svg>
  )
}

export default function ContactUs() {
  return (
    <section id='contact' className='scroll-mt-24 py-16'>
      <div className='mx-auto max-w-270 px-6'>
        <SectionHead
          kicker='Contact us'
          title={
            <>
              Talk to us.
            </>
          }
        />

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          onClick={() => trackEvent({ event: 'contact_us_click', cta_name: 'contact_email' })}
          className='btn-lift mx-auto flex max-w-110 items-center gap-3.5 rounded-2xl border border-border bg-surface px-5 py-4.5 text-left hover:border-dark dark:hover:border-lime'
        >
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark text-lime dark:border dark:border-border dark:bg-surface-2'>
            <MailIcon />
          </div>
          <div className='min-w-0'>
            <div className='text-[10.5px] font-bold tracking-[0.06em] text-success uppercase'>
              Email us
            </div>
            <div className='truncate font-display text-base font-black text-ink'>
              {SUPPORT_EMAIL}
            </div>
            <div className='mt-0.5 text-xs font-medium text-muted'>
              Send us a message any time
            </div>
          </div>
        </a>

        <div className='mx-auto mt-9 max-w-225 text-center'>
          <div className='mb-4 text-xs font-bold tracking-[0.08em] text-muted uppercase'>
            Follow @santibetng
          </div>
          <div className='flex flex-wrap justify-center gap-2.5'>
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target='_blank'
                rel='noreferrer'
                aria-label={`SantiBet on ${s.label}`}
                onClick={() =>
                  trackEvent({ event: 'social_link_click', social_platform: s.name, cta_name: 'contact_social' })
                }
                className='btn-lift flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-lime-ink  hover:border-dark hover:bg-lime dark:hover:text-[#10230a]! dark:hover:border-lime'
              >
                <SocialIcon name={s.name} className='h-4.5 w-4.5' />
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
