'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Rocket01Icon } from '@hugeicons/core-free-icons'
import { useActiveCampaign } from '../hooks/useCampaign'
import { useCountdown } from '../hooks/useCountdown'

function formatLaunchDate(iso: string | null, timeZone: string | undefined) {
  if (!iso) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso))
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className='min-w-13 flex-1 rounded-lg border border-lime/20 bg-[#000]/25 px-2 py-1.5 text-center sm:flex-none dark:bg-[#000]/30'>
      <div className='text-xl leading-none font-extrabold text-lime tabular-nums [text-shadow:0_0_8px_rgb(191_250_0/0.4)]'>
        {value}
      </div>
      <div className='mt-1 text-[9px] font-semibold tracking-[0.06em] text-white/55 uppercase dark:text-muted'>
        {label}
      </div>
    </div>
  )
}

export default function LaunchCountdown() {
  const { activeCampaign } = useActiveCampaign()
  const target = activeCampaign?.launchAt ?? activeCampaign?.startsOn ?? null
  const live = useCountdown(target)
  const launchDate = formatLaunchDate(target, activeCampaign?.timeZone)

  return (
    <div
      aria-label='Countdown to SantiBet launch'
      className='relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-lime/25 bg-dark px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:bg-surface-2'
    >
      <div
        aria-hidden='true'
        className='animate-shimmer pointer-events-none absolute inset-0 bg-linear-90 from-transparent via-lime/10 to-transparent'
      />
      <div className='relative flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-start sm:gap-1'>
        <div className='flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-lime uppercase'>
          <HugeiconsIcon icon={Rocket01Icon} size={14} />
          Launch Countdown
        </div>
        {launchDate && (
          <div className='text-xs font-medium text-white/70 dark:text-muted'>
            {launchDate}
          </div>
        )}
      </div>
      <div className='relative flex shrink-0 gap-1.5'>
        <Unit value={live?.days ?? '—'} label='Days' />
        <Unit value={live?.hours ?? '—'} label='Hrs' />
        <Unit value={live?.mins ?? '—'} label='Min' />
        <Unit value={live?.secs ?? '—'} label='Sec' />
      </div>
    </div>
  )
}
