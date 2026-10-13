'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type PanelTab = 'leaderboard' | 'prizes' | 'points' | 'tiers' | 'invite'

export const PANEL_TABS: { key: PanelTab; label: string }[] = [
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'prizes', label: 'Prizes' },
  { key: 'points', label: 'Points' },
  { key: 'tiers', label: 'Tiers' },
  { key: 'invite', label: 'Share' },
]

interface PanelState {
  tab: PanelTab
  setTab: (tab: PanelTab) => void
  menuOpen: boolean
  closeMenu: () => void
  toggleMenu: () => void
  /** Opens the side menu on the given tab. */
  showPanel: (tab?: PanelTab) => void
}

const PanelContext = createContext<PanelState | null>(null)

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<PanelTab>('leaderboard')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function showPanel(next?: PanelTab) {
    if (next) setTab(next)
    setMenuOpen(true)
  }

  return (
    <PanelContext.Provider
      value={{
        tab,
        setTab,
        menuOpen,
        closeMenu: () => setMenuOpen(false),
        toggleMenu: () => setMenuOpen((open) => !open),
        showPanel,
      }}
    >
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error('usePanel must be used inside <PanelProvider>')
  return ctx
}
