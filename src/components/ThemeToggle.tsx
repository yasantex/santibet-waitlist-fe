'use client'

import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className='fixed bottom-4 right-4 z-50 flex items-center gap-0.5 rounded-full border border-border bg-surface p-1 shadow-lg'>
      <button
        type='button'
        onClick={() => setTheme('light')}
        className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors ${
          theme === 'light' ? 'bg-dark text-white' : 'text-muted'
        }`}
      >
        Light
      </button>
      <button
        type='button'
        onClick={() => setTheme('dark')}
        className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors ${
          theme === 'dark' ? 'bg-lime text-lime-ink' : 'text-muted'
        }`}
      >
        Dark
      </button>
    </div>
  )
}
