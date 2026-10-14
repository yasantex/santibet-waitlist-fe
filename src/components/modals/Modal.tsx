'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** Pinned under the title, above the scrolling body (e.g. tabs). */
  toolbar?: React.ReactNode
  /** Tailwind max-width class for the dialog. */
  maxWidth?: string
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  toolbar,
  maxWidth = 'max-w-120',
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
        className='absolute inset-0 bg-[#000]/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div
        className={`animate-slide-up relative flex max-h-[80vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgb(0_0_0/0.45)]`}
      >
        <div className='flex items-start justify-between gap-4 border-b border-border px-5 py-4'>
          <div>
            <h3
              id='modal-title'
              className='font-display text-lg font-bold tracking-[-0.01em] text-foreground'
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
            className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors hover:bg-border hover:text-foreground'
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </button>
        </div>

        {toolbar}

        <div className='modal-scroll flex-1 overflow-y-auto px-5 py-4'>
          {children}
        </div>

        {footer && (
          <div className='border-t border-border bg-surface px-5 py-4'>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
