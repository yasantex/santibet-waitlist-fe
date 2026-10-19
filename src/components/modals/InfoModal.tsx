'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, Mail01Icon } from '@hugeicons/core-free-icons'
import Modal from './Modal'
import Markdown from '../Markdown'
import {
  PRIVACY_SECTION_TITLE,
  RulesSections,
  useRulesSections,
} from './WaitlistRulesModal'
import { SOCIAL_ICON } from '../socialIcons'
import { SUPPORT_EMAIL, socialLinks, trackEvent } from '../../utils/constants'
import {
  useActiveCampaign,
  useContentPage,
  useContentPages,
} from '../../hooks/useCampaign'

/** A page slug: one of the built-in pages below, or any page the API publishes. */
export type InfoTab = string

type BuiltInTab = 'privacy' | 'terms' | 'faq' | 'contact'

// Built-in content, shown for any of these the API hasn't published (all of them, for now).
const BUILT_IN_TABS: { key: BuiltInTab; label: string }[] = [
  { key: 'privacy', label: 'Privacy' },
  { key: 'terms', label: 'Terms' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
]

function isBuiltIn(tab: InfoTab): tab is BuiltInTab {
  return BUILT_IN_TABS.some((t) => t.key === tab)
}

/**
 * The footer's pages: the built-in four, then any other page the API publishes for this
 * campaign — so new pages appear without a code change.
 */
export function useInfoTabs(): { key: InfoTab; label: string }[] {
  const { activeCampaign } = useActiveCampaign()
  const { data } = useContentPages(activeCampaign?.slug)
  const extra = (data?.data ?? [])
    .filter((p) => !isBuiltIn(p.slug))
    .map((p) => ({ key: p.slug, label: p.title }))
  return [...BUILT_IN_TABS, ...extra]
}

const TITLES: Record<BuiltInTab, string> = {
  privacy: 'Privacy Policy',
  terms: 'Waitlist & Prediction Rules',
  faq: 'Frequently Asked Questions',
  contact: 'Contact Us',
}

type Faq = { id: string; q: string; a: React.ReactNode }

function BuiltInFaq({ onOpenTerms }: { onOpenTerms: () => void }) {
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
          Eligible correct predictions can qualify you for the launch-day prize draw. The
          draw has multiple prizes, including the grand prize. See the{' '}
          <button
            type='button'
            onClick={onOpenTerms}
            className='link-action font-semibold text-dark dark:text-lime'
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
  return <FaqAccordion faqs={faqs} />
}

/** An FAQ page body: one `##` heading per question, its answer below it. */
function MarkdownFaq({ body }: { body: string }) {
  const [intro, ...sections] = body.split(/^## /m)
  const faqs: Faq[] = sections.map((section, i) => {
    const [question, ...answer] = section.split('\n')
    return {
      id: `q${i + 1}`,
      q: question.trim(),
      a: <Markdown>{answer.join('\n').trim()}</Markdown>,
    }
  })
  return (
    <div className='flex flex-col gap-4'>
      {intro.trim() && <Markdown>{intro.trim()}</Markdown>}
      <FaqAccordion faqs={faqs} />
    </div>
  )
}

function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    const opening = openId !== id
    setOpenId(opening ? id : null)
    trackEvent({ event: 'faq_interaction', faq_id: id, faq_action: opening ? 'open' : 'close' })
  }

  return (
    <div className='flex flex-col gap-2'>
      {faqs.map((faq) => {
        const open = openId === faq.id
        return (
          <div
            key={faq.id}
            className={`overflow-hidden rounded-xl border bg-surface-2 transition-colors ${
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
                className='flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-3 text-left'
              >
                <span className='text-sm font-semibold text-foreground'>{faq.q}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={16}
                  className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
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
                <div className='px-3.5 pb-3.5 text-sm leading-relaxed text-muted'>{faq.a}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Contact() {
  return (
    <div className='flex flex-col gap-5'>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        onClick={() => trackEvent({ event: 'contact_us_click', cta_name: 'contact_email' })}
        className='btn-lift flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3.5 hover:border-dark dark:hover:border-lime'
      >
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime text-lime-ink'>
          <HugeiconsIcon icon={Mail01Icon} size={19} />
        </span>
        <span className='min-w-0'>
          <span className='block text-[10px] font-bold tracking-widest text-success uppercase'>
            Email us
          </span>
          <span className='block truncate text-sm font-bold text-foreground'>
            {SUPPORT_EMAIL}
          </span>
          <span className='block text-xs text-muted'>Send us a message any time</span>
        </span>
      </a>

      <div>
        <h4 className='mb-2 text-sm font-bold text-foreground'>Follow @santibetng</h4>
        <div className='flex flex-wrap gap-2'>
          {socialLinks.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target='_blank'
              rel='noreferrer'
              aria-label={`SantiBet on ${s.label}`}
              onClick={() =>
                trackEvent({
                  event: 'social_link_click',
                  social_platform: s.name,
                  cta_name: 'contact_social',
                })
              }
              className='btn-lift flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-lime hover:bg-lime hover:text-lime-ink'
            >
              <HugeiconsIcon icon={SOCIAL_ICON[s.name]} size={15} />
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatUpdated(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

/**
 * Privacy / Terms / FAQ / Contact and any other published page, opened from the footer.
 * A page the API publishes wins; otherwise the built-in version shows (a 404 PAGE_NOT_FOUND
 * just means nothing is published yet).
 */
export default function InfoModal({
  tab,
  onTabChange,
  onClose,
}: {
  /** Open on this tab; null keeps the modal closed. */
  tab: InfoTab | null
  onTabChange: (tab: InfoTab) => void
  onClose: () => void
}) {
  const { activeCampaign } = useActiveCampaign()
  const tabs = useInfoTabs()
  const { data: page, isLoading, isError } = useContentPage(tab, activeCampaign?.slug)
  const showPublished = Boolean(page) && !isError
  const builtIn = tab && isBuiltIn(tab) ? tab : null
  const sections = useRulesSections()
  const privacy = sections.filter((s) => s.title === PRIVACY_SECTION_TITLE)
  const terms = sections.filter((s) => s.title !== PRIVACY_SECTION_TITLE)

  return (
    <Modal
      open={tab != null}
      onClose={onClose}
      title={
        showPublished && page
          ? page.title
          : builtIn
            ? TITLES[builtIn]
            : (tabs.find((t) => t.key === tab)?.label ?? '')
      }
      toolbar={
        <div
          role='tablist'
          aria-label='Information'
          className='no-scrollbar flex gap-4 overflow-x-auto border-b border-border px-5'
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type='button'
              role='tab'
              aria-selected={t.key === tab}
              onClick={() => onTabChange(t.key)}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 py-2.5 text-xs font-semibold transition-colors ${
                t.key === tab
                  ? 'border-lime text-foreground dark:text-lime'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      {showPublished && page ? (
        <div className='flex flex-col gap-4'>
          {page.slug === 'faq' ? <MarkdownFaq body={page.body} /> : <Markdown>{page.body}</Markdown>}
          <p className='border-t border-border pt-3 text-xs text-neutral-10'>
            Last updated {formatUpdated(page.updatedAt)}
          </p>
        </div>
      ) : isLoading ? (
        <p className='py-6 text-center text-sm text-muted'>Loading…</p>
      ) : !builtIn ? (
        <p className='py-6 text-center text-sm text-muted'>
          This page isn&apos;t available right now.
        </p>
      ) : null}

      {!showPublished && !isLoading && builtIn === 'privacy' && (
        <div className='flex flex-col gap-5'>
          <p className='text-sm leading-6 text-muted'>
            At SantiBet we collect only what we need to run the waitlist, verify your
            number and deliver your predictions and prizes.
          </p>
          <RulesSections sections={privacy} />
          <p className='text-sm leading-6 text-muted'>
            <strong className='font-semibold text-foreground'>Your rights:</strong> you can
            ask us to delete your data at any time by emailing{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className='link-action font-semibold text-dark dark:text-lime'
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      )}
      {!showPublished && !isLoading && builtIn === 'terms' && (
        <RulesSections sections={terms} />
      )}
      {!showPublished && !isLoading && builtIn === 'faq' && (
        <BuiltInFaq onOpenTerms={() => onTabChange('terms')} />
      )}
      {!showPublished && !isLoading && builtIn === 'contact' && <Contact />}
    </Modal>
  )
}
