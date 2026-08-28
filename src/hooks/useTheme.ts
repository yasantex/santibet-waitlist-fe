'use client'

import { useEffect, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'santibet-theme'
const THEME_EVENT = 'santibet-theme-change'

function resolveTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', callback)
  window.addEventListener(THEME_EVENT, callback)
  return () => {
    mq.removeEventListener('change', callback)
    window.removeEventListener(THEME_EVENT, callback)
  }
}

function getServerSnapshot(): Theme {
  return 'light'
}

/** Reads/writes the site theme. Defaults to the OS preference until the user picks one explicitly. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, resolveTheme, getServerSnapshot)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function setTheme(next: Theme) {
    localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return { theme, setTheme }
}
