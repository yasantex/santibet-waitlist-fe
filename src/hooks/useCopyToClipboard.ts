'use client'

import { useEffect, useRef, useState } from 'react'

/** Copies text and flips `copied` on for a moment, for "Copy" → "Copied!" buttons. */
export function useCopyToClipboard(resetMs = 1800) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard API unavailable — ignore, the link stays selectable
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), resetMs)
  }

  return { copied, copy }
}
