'use client'

import { ChampionIcon } from '@hugeicons/core-free-icons'
import {
  useActiveCampaign,
  useCampaignRules,
  useLeaderboard,
  useStanding,
} from '../../hooks/useCampaign'
import { useAppSelector } from '../../redux/hooks'
import { levelName, sortLevels } from '../../utils/levels'
import { maskPhone } from '../market-card/utils'
import SectionTitle, { PanelMessage } from './SectionTitle'

// Gold, silver, bronze for the top three.
const RANK_STYLE = [
  'bg-[#facc15] text-[#422006]',
  'bg-[#9ca3af] text-white',
  'bg-[#c2703d] text-white',
]

/** Tier names read "Pro Founder" etc. — the board already says Founders, so drop it. */
function tierLabel(name: string | null) {
  return name?.replace(/\s*Founder$/i, '') || null
}

/** 4 → "#0004" */
function founderNo(participantNumber: number) {
  return `#${String(participantNumber).padStart(4, '0')}`
}

/** The API's masked number (+234******5494) in display form: 234••••••5494. */
function displayPhone(masked: string) {
  return masked.replace(/^\+/, '').replace(/\*/g, '•')
}

function Row({
  rank,
  name,
  founder,
  tier,
  points,
  you,
}: {
  rank: number | null
  /** The masked number, or the Founder number for an email joiner. */
  name: string
  /** "#0004" under the number; omitted when `name` already is the Founder number. */
  founder: string | null
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
          {you && <span className='sr-only'> (you)</span>}
        </div>
        <div className='text-[11px] text-muted'>
          {[founder, tier].filter(Boolean).join(' · ')}
        </div>
      </div>
      <span className='shrink-0 text-[13px] font-bold text-success'>
        {points.toLocaleString()}pt
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
  const currentPhone = useAppSelector((s) => s.campaign.currentPhone)
  const levels = sortLevels(rules?.levels)
  const rows = data?.data ?? []
  const youOnBoard =
    standing != null && rows.some((r) => r.participantNumber === standing.participantNumber)

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
                  entry.phone
                    ? displayPhone(entry.phone)
                    : founderNo(entry.participantNumber)
                }
                founder={entry.phone ? founderNo(entry.participantNumber) : null}
                tier={tierLabel(levelName(levels, entry.level))}
                points={entry.points}
                you={you}
              />
            )
          })}
          {standing && !youOnBoard && (
            <Row
              rank={standing.rank}
              name={
                currentPhone
                  ? maskPhone(currentPhone)
                  : founderNo(standing.participantNumber)
              }
              founder={currentPhone ? founderNo(standing.participantNumber) : null}
              tier={tierLabel(levelName(levels, standing.level))}
              points={standing.points}
              you
            />
          )}
        </>
      )}
    </div>
  )
}
