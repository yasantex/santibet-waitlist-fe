'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className='fixed inset-0 z-999 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <div
        className='absolute inset-0 bg-dark/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative flex max-h-[70vh] w-full max-w-150 flex-col overflow-hidden rounded-2xl border-2 border-dark bg-surface shadow-2xl dark:border-lime'>
        <div className='flex items-start justify-between gap-4 border-b border-border px-6 pt-6 pb-4'>
          <div>
            <h3
              id='modal-title'
              className='font-display text-xl font-black tracking-[-0.01em] text-ink'
            >
              {title}
            </h3>
            {subtitle && (
              <p className='mt-1 text-xs font-medium text-muted'>
                {subtitle}
              </p>
            )}
          </div>

          <button
            type='button'
            onClick={onClose}
            aria-label='Close'
            className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-lg font-bold text-muted transition-colors hover:bg-surface-2 hover:text-ink'
          >
            ×
          </button>
        </div>

        <div className='modal-scroll flex-1 overflow-y-auto px-6 py-5'>
          {children}
        </div>

        {footer && (
          <div className='border-t border-border bg-surface px-6 py-5'>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
