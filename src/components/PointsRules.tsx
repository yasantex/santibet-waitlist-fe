'use client'

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  CancelCircleIcon,
  FireIcon,
  Rocket01Icon,
  Target02Icon,
  Tick02Icon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons'
import { useActiveCampaign, useCampaignRules } from '../hooks/useCampaign'

type Tone = 'lime' | 'dark' | 'error'

interface Rule {
  key: string
  icon: IconSvgElement
  tone: Tone
  title: string
  desc: string
  points: number
}

const TONE_CLASS: Record<Tone, string> = {
  lime: 'bg-lime/25 text-dark dark:bg-lime/15 dark:text-lime',
  dark: 'bg-dark/10 text-dark dark:bg-success/15 dark:text-success',
  error: 'bg-error/10 text-error',
}

export function RuleRow({
  icon,
  tone,
  title,
  desc,
  value,
}: {
  icon: IconSvgElement
  tone: Tone
  title: string
  desc: string
  value: string
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-2.5'>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_CLASS[tone]}`}
      >
        <HugeiconsIcon icon={icon} size={18} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-[13px] font-semibold text-foreground'>{title}</div>
        <div className='text-xs text-muted'>{desc}</div>
      </div>
      <div
        className={`shrink-0 text-base font-extrabold ${
          tone === 'error' ? 'text-muted' : 'text-success'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

/** How points are earned, built from the campaign's scoring rules. */
export default function PointsRules() {
  const { activeCampaign } = useActiveCampaign()
  const { data: rules } = useCampaignRules(activeCampaign?.slug)

  if (!rules) {
    return <div className='py-6 text-center text-sm text-muted'>Loading points…</div>
  }

  const { scoring } = rules
  const candidates: Rule[] = [
    {
      key: 'correct',
      icon: Target02Icon,
      tone: 'lime',
      title: 'Correct Prediction',
      desc: "Get today's question right",
      points: scoring.pointsPerCorrectPrediction,
    },
    {
      key: 'predict',
      icon: Tick02Icon,
      tone: 'lime',
      title: 'Make a Prediction',
      desc: 'Just for playing today',
      points: scoring.pointsPerPrediction,
    },
    {
      key: 'join',
      icon: Rocket01Icon,
      tone: 'dark',
      title: 'Join the Waitlist',
      desc: 'One-time welcome points',
      points: scoring.pointsForJoining,
    },
    ...rules.streakBonuses
      .slice()
      .sort((a, b) => a.streakLength - b.streakLength)
      .map<Rule>((b) => ({
        key: `streak-${b.streakLength}`,
        icon: FireIcon,
        tone: 'dark',
        title: `${b.streakLength}-Day Streak`,
        desc: `Play ${b.streakLength} days in a row`,
        points: b.bonusPoints,
      })),
    {
      key: 'referral',
      icon: UserAdd01Icon,
      tone: 'dark',
      title: 'Successful Referral',
      desc:
        scoring.pointsPerReferee > 0
          ? `Friend makes their first prediction (they get +${scoring.pointsPerReferee})`
          : 'Friend makes their first prediction',
      points: scoring.pointsPerReferral,
    },
  ]
  const list = candidates.filter((r) => r.points > 0)

  return (
    <div className='flex flex-col gap-2'>
      {list.map((r) => (
        <RuleRow
          key={r.key}
          icon={r.icon}
          tone={r.tone}
          title={r.title}
          desc={r.desc}
          value={`+${r.points}`}
        />
      ))}
      <RuleRow
        icon={CancelCircleIcon}
        tone='error'
        title='Wrong Prediction'
        desc='No penalty during waitlist'
        value='0'
      />
    </div>
  )
}
