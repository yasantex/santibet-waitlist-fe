'use client'

import Image from 'next/image'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons'
import { usePanel } from './PanelContext'
import { scrollMainToTop } from '../utils/page'

export default function Header() {
  const { menuOpen, toggleMenu, closeMenu } = usePanel()

  return (
    <header className='relative z-50 h-14 shrink-0 border-b border-border bg-paper'>
      <div className='mx-auto flex h-full max-w-300 items-center justify-between gap-3 px-4'>
        <button
          type='button'
          onClick={() => {
            closeMenu()
            scrollMainToTop()
          }}
          aria-label='Scroll to top'
          className='shrink-0 cursor-pointer transition-opacity hover:opacity-80 active:opacity-60'
        >
          <Image
            src='/Santibet Logo.svg'
            alt='SantiBet'
            width={100}
            height={40}
            className='h-7 w-auto dark:invert'
            priority
          />
        </button>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls='side-menu'
            className='relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-dark active:scale-95 dark:hover:border-lime'
          >
            <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} size={18} />
            {!menuOpen && (
              <span
                aria-hidden='true'
                className='animate-pulse-dot absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-paper bg-error'
              />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
