'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ChampionIcon } from '@hugeicons/core-free-icons'
import { usePanel } from './PanelContext'
import { trackEvent } from '../utils/constants'

/** Shortcut into the menu's leaderboard tab. */
export default function QuickLeaderboardLink() {
  const { showPanel } = usePanel()
  return (
    <button
      type='button'
      onClick={() => {
        showPanel('leaderboard')
        trackEvent({ event: 'cta_click', cta_name: 'quick_leaderboard' })
      }}
      className='btn-lift mx-auto flex items-center gap-1.5 rounded-full border border-dark/20 bg-lime/20 px-4 py-2 text-xs font-semibold text-dark dark:border-lime/25 dark:bg-lime/10 dark:text-lime'
    >
      <HugeiconsIcon icon={ChampionIcon} size={14} />
      See Leaderboard
    </button>
  )
}
