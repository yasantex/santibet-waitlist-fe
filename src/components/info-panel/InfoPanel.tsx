'use client'

import { PANEL_TABS, usePanel, type PanelTab } from '../PanelContext'
import LeaderboardPanel from './LeaderboardPanel'
import PrizesPanel from './PrizesPanel'
import PointsPanel from './PointsPanel'
import TiersPanel from './TiersPanel'
import InvitePanel from './InvitePanel'

const PANELS: Record<PanelTab, React.ComponentType> = {
  leaderboard: LeaderboardPanel,
  prizes: PrizesPanel,
  points: PointsPanel,
  tiers: TiersPanel,
  invite: InvitePanel,
}

/** Leaderboard / Prizes / Points / Tiers / Invite tabs. `idPrefix` keeps ARIA ids unique per copy. */
export default function InfoPanel({
  idPrefix,
  stickyTabsClass = '',
}: {
  idPrefix: string
  /** Extra classes for the tab bar, e.g. to pin it inside a scrolling drawer. */
  stickyTabsClass?: string
}) {
  const { tab, setTab } = usePanel()
  const Active = PANELS[tab]

  return (
    <>
      <div
        role='tablist'
        aria-label='Waitlist info'
        className={`no-scrollbar flex gap-4 overflow-x-auto border-b border-border px-4 ${stickyTabsClass}`}
      >
        {PANEL_TABS.map((t) => {
          const selected = t.key === tab
          return (
            <button
              key={t.key}
              type='button'
              role='tab'
              id={`${idPrefix}-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel`}
              onClick={() => setTab(t.key)}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selected
                  ? 'border-lime text-foreground dark:text-lime'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        role='tabpanel'
        id={`${idPrefix}-panel`}
        aria-labelledby={`${idPrefix}-tab-${tab}`}
        key={tab}
        className='animate-slide-up p-4'
      >
        <Active />
      </div>
    </>
  )
}
