'use client'

import { useActiveCampaign } from '../hooks/useCampaign'
import { useCountdown } from '../hooks/useCountdown'

const loadingCountdown = {
  days: '—',
  hours: '—',
  mins: '—',
  secs: '—',
}

function FlipUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className='flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-lime/25 bg-white/8 py-3.5'>
      <div className='text-center text-[clamp(20px,7vw,30px)] font-black leading-none text-white dark:text-ink'>
        {value}
      </div>
      <div className='text-[10px] tracking-[0.08em] uppercase text-white/55 dark:text-muted font-semibold'>
        {label}
      </div>
    </div>
  )
}

function formatLaunchDate(iso: string | null, timeZone: string | undefined) {
  if (!iso) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(iso))
}

export default function CountdownTimer() {
  const { activeCampaign } = useActiveCampaign()
  const target = activeCampaign?.launchAt ?? activeCampaign?.startsOn ?? null
  const live = useCountdown(target)

  const { days, hours, mins, secs } = live ?? loadingCountdown
  const launchDateLabel = formatLaunchDate(target, activeCampaign?.timeZone)

  return (
    <div
      className='relative mx-auto w-full max-w-100 overflow-hidden rounded-2xl bg-dark px-4.5 py-5 sm:px-6 md:max-w-none dark:border dark:border-border dark:bg-surface-2'
      aria-label='Countdown to SantiBet launch'
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -top-15 -right-15 h-45 w-45 rounded-full bg-dark-2 opacity-70 dark:bg-lime dark:opacity-[0.06]'
      />
      <div className='relative mb-3.5 text-[11px] font-bold tracking-[0.12em] uppercase text-lime'>
        Launch T-Minus
      </div>
      <div className='relative flex gap-2.5'>
        <FlipUnit value={days} label='Days' />
        <FlipUnit value={hours} label='Hrs' />
        <FlipUnit value={mins} label='Min' />
        <FlipUnit value={secs} label='Sec' />
      </div>
      {launchDateLabel && (
        <div className='relative mt-4 flex flex-wrap items-baseline justify-between gap-1.5 text-[12.5px] font-semibold text-white/80 dark:text-muted'>
          <span>Launch date</span>
          <span className='text-sm font-black text-white dark:text-ink'>
            {launchDateLabel}
          </span>
        </div>
      )}
    </div>
  )
}
