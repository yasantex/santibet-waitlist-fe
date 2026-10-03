'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '../hooks/useTheme'

/** Site-wide toast outlet: brand green with a lime accent, following the light/dark toggle. */
export default function Toaster() {
  const { theme } = useTheme()
  return (
    <SonnerToaster
      theme={theme}
      position='top-right'
      offset={{ top: 50 }}
      mobileOffset={{ top: 50 }}
      visibleToasts={3}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'font-body flex w-full items-center gap-3 rounded-xl border-l-4 border-lime bg-dark px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,51,38,0.25)] sm:w-89 dark:border dark:border-l-4 dark:border-border dark:border-l-lime dark:bg-surface-2 dark:text-foreground dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
          icon: 'm-0! h-7! w-7! shrink-0 items-center justify-center! rounded-full bg-lime text-lime-ink',
          title: 'leading-snug',
        },
      }}
    />
  )
}
