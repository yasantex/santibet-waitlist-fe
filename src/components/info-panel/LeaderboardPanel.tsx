'use client'

import { ChampionIcon } from '@hugeicons/core-free-icons'
import {
  useActiveCampaign,
  useCampaignRules,
  useLeaderboard,
  useStanding,
} from '../../hooks/useCampaign'
import { levelName, sortLevels } from '../../utils/levels'
import SectionTitle, { PanelMessage } from './SectionTitle'

const RANK_STYLE = [
  'bg-lime text-lime-ink',
  'bg-dark text-lime dark:bg-success dark:text-lime-ink',
  'bg-success/80 text-white dark:text-lime-ink',
]

function Row({
  rank,
  name,
  tier,
  points,
  you,
}: {
  rank: number | null
  name: string
  tier: string | null
  points: number
  you?: boolean
}) {
  const style =
    you
      ? 'border border-success bg-success/10 text-success'
      : rank != null && rank <= 3
        ? RANK_STYLE[rank - 1]
        : 'bg-surface-2 text-muted'
  return (
    <div className='flex items-center gap-3 border-b border-border py-2.5 last:border-b-0'>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${style}`}
      >
        {rank ?? '—'}
      </span>
      <div className='min-w-0 flex-1'>
        <div
          className={`truncate text-[13px] font-semibold ${you ? 'text-success' : 'text-foreground'}`}
        >
          {name}
        </div>
        {tier && <div className='text-[11px] text-muted'>{tier}</div>}
      </div>
      <span className='shrink-0 text-[13px] font-bold text-dark dark:text-lime'>
        {points.toLocaleString()} pts
      </span>
    </div>
  )
}

export default function LeaderboardPanel() {
  const { activeCampaign } = useActiveCampaign()
  const slug = activeCampaign?.slug
  const { data, isLoading } = useLeaderboard(slug, 5)
  const { data: rules } = useCampaignRules(slug)
  const standing = useStanding(slug)
  const levels = sortLevels(rules?.levels)
  const rows = data?.data ?? []
  const youOnBoard =
    standing != null && rows.some((r) => r.participantNumber === standing.participantNumber)
  const remaining = activeCampaign
    ? Math.max(activeCampaign.participantCount - rows.length, 0)
    : 0

  return (
    <div>
      <SectionTitle icon={ChampionIcon}>Top Founders</SectionTitle>
      {isLoading ? (
        <PanelMessage>Loading leaderboard…</PanelMessage>
      ) : rows.length === 0 ? (
        <PanelMessage>No Founders on the board yet — be the first to predict.</PanelMessage>
      ) : (
        <>
          {rows.map((entry, i) => {
            const you = standing?.participantNumber === entry.participantNumber
            return (
              <Row
                key={entry.participantNumber}
                rank={i + 1}
                name={
                  you
                    ? `You · Founder #${entry.participantNumber}`
                    : `Founder #${entry.participantNumber}`
                }
                tier={levelName(levels, entry.level)}
                points={entry.points}
                you={you}
              />
            )
          })}
          {standing && !youOnBoard && (
            <Row
              rank={standing.rank}
              name={`You · Founder #${standing.participantNumber.toLocaleString()}`}
              tier={levelName(levels, standing.level)}
              points={standing.points}
              you
            />
          )}
          {remaining > 0 && (
            <div className='pt-3 text-center text-xs text-muted'>
              {remaining.toLocaleString()} more Founders climbing the board
            </div>
          )}
        </>
      )}
    </div>
  )
}
