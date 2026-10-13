'use client'

import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    // Sits just above the footer, which publishes its height as --footer-h.
    <div className='fixed right-4 bottom-[calc(var(--footer-h,0px)+12px)] z-50 flex items-center gap-0.5 rounded-full border border-border bg-surface p-1 shadow-lg'>
      <button
        type='button'
        onClick={() => setTheme('light')}
        className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors active:scale-95 ${
          theme === 'light'
            ? 'bg-dark text-white'
            : 'text-muted hover:bg-surface-2 hover:text-ink'
        }`}
      >
        Light
      </button>
      <button
        type='button'
        onClick={() => setTheme('dark')}
        className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors active:scale-95 ${
          theme === 'dark'
            ? 'bg-lime text-lime-ink'
            : 'text-muted hover:bg-surface-2 hover:text-ink'
        }`}
      >
        Dark
      </button>
    </div>
  )
}
