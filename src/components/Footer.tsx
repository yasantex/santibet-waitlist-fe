'use client'

import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import InfoModal, { INFO_TABS, type InfoTab } from './modals/InfoModal'
import { SOCIAL_ICON } from './socialIcons'
import { socialLinks, trackEvent } from '../utils/constants'

// The footer row shows the four main networks; LinkedIn stays in the Contact tab.
const FOOTER_SOCIALS = socialLinks.filter((s) => s.name !== 'linkedin')

export default function Footer() {
  const [infoTab, setInfoTab] = useState<InfoTab | null>(null)
  const year = new Date().getFullYear()
  const ref = useRef<HTMLElement>(null)

  // Publishes the footer's height (it wraps on small screens) so the theme toggle and the
  // thank-you screen can sit just above it.
  useEffect(() => {
    const footer = ref.current
    if (!footer) return
    const root = document.documentElement
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--footer-h', `${footer.offsetHeight}px`)
    })
    observer.observe(footer)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--footer-h')
    }
  }, [])

  function openTab(tab: InfoTab) {
    setInfoTab(tab)
    if (tab === 'terms') trackEvent({ event: 'rules_opened', cta_name: 'footer_terms' })
  }

  return (
    <footer
      ref={ref}
      className='relative z-40 shrink-0 border-t border-border bg-paper px-4 py-3 text-center sm:py-4'
    >
      <div className='flex flex-wrap items-center justify-center gap-4'>
        <div className='flex items-center gap-4'>
          {FOOTER_SOCIALS.map((s) => (
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
                  cta_name: 'footer_social',
                })
              }
              className='text-muted transition-[color,transform] hover:-translate-y-px hover:text-dark dark:hover:text-lime'
            >
              <HugeiconsIcon icon={SOCIAL_ICON[s.name]} size={24} />
            </a>
          ))}
        </div>
        <span className='rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-muted'>
          18+ · Must be 18 or older
        </span>
      </div>

      <nav aria-label='Information' className='mt-3 flex flex-wrap justify-center gap-6'>
        {INFO_TABS.map((t) => (
          <button
            key={t.key}
            type='button'
            onClick={() => openTab(t.key)}
            className='cursor-pointer text-sm text-muted transition-colors hover:text-dark dark:hover:text-lime'
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className='mt-2 text-sm text-neutral-10'>
        © {year} Awa Lawa Limited · Santibet · Early Access
      </div>

      <InfoModal tab={infoTab} onTabChange={openTab} onClose={() => setInfoTab(null)} />
    </footer>
  )
}
