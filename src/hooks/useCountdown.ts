'use client'

import { useEffect, useState } from 'react'

const pad = (n: number) => String(Math.max(n, 0)).padStart(2, '0')

export interface CountdownParts {
  days: string
  hours: string
  mins: string
  secs: string
  totalMs: number
  reached: boolean
}

function computeParts(targetMs: number): CountdownParts {
  const totalMs = targetMs - Date.now()
  const reached = totalMs <= 0
  const clamped = Math.max(totalMs, 0)
  const totalSeconds = Math.floor(clamped / 1000)
  return {
    days: pad(Math.floor(totalSeconds / 86400)),
    hours: pad(Math.floor((totalSeconds % 86400) / 3600)),
    mins: pad(Math.floor((totalSeconds % 3600) / 60)),
    secs: pad(totalSeconds % 60),
    totalMs: clamped,
    reached,
  }
}

/** Ticks every second toward an ISO timestamp. Returns null while there is nothing to count down to. */
export function useCountdown(targetIso: string | null | undefined) {
  const targetMs = targetIso ? new Date(targetIso).getTime() : null
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!targetMs) return
    const id = setInterval(() => forceTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return targetMs ? computeParts(targetMs) : null
}
