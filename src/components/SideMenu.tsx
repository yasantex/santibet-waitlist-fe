'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import InfoPanel from './info-panel/InfoPanel'
import { usePanel } from './PanelContext'

/** Slide-in drawer holding the Leaderboard / Prizes / Points / Tiers / Share tabs. */
export default function SideMenu() {
  const { menuOpen, closeMenu } = usePanel()

  return (
    <div>
      <div
        aria-hidden='true'
        onClick={closeMenu}
        className={`fixed inset-0 z-90 bg-[#000]/60 backdrop-blur-sm transition-opacity duration-250 ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        id='side-menu'
        role='dialog'
        aria-modal='true'
        aria-label='Menu'
        inert={!menuOpen}
        className={`fixed top-0 right-0 z-100 flex h-dvh w-full max-w-90 flex-col overflow-y-auto *:shrink-0 border-l border-border bg-surface transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          menuOpen
            ? 'translate-x-0 shadow-[-10px_0_40px_rgb(0_0_0/0.35)]'
            : 'translate-x-full'
        }`}
      >
        <div className='sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3'>
          <span className='text-sm font-bold text-foreground'>Menu</span>
          <button
            type='button'
            onClick={closeMenu}
            aria-label='Close menu'
            className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors hover:bg-border hover:text-foreground'
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </button>
        </div>
        <InfoPanel idPrefix='menu' stickyTabsClass='sticky top-14 z-9 bg-surface' />
      </aside>
    </div>
  )
}
