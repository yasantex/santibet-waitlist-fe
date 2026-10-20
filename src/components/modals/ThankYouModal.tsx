'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Share08Icon,
  SparklesIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import type { PredictionSide } from '../../utils/types'
import type { PredictionParticipant } from '../../types/campaign'
import ShareReferral from '../market-card/ShareReferral'
import { BACK_LINK_CLASS, primaryButtonClass } from '../market-card/utils'

interface ThankYouModalProps {
  open: boolean
  pickedSide: PredictionSide | null
  /** Founder details of the number the call went in for; null when we don't have them. */
  founder: PredictionParticipant | null
  closesClock: string
  grandPrizeLabel: string
  referralPoints: number | null
  onClose: () => void
  onPredictAnother: () => void
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-border bg-surface-2 px-2 py-2.5 text-center'>
      <div className='truncate text-base font-extrabold text-success tabular-nums sm:text-lg'>
        {value}
      </div>
      <div className='text-[10px] font-semibold tracking-[0.06em] text-muted uppercase'>
        {label}
      </div>
    </div>
  )
}

// Shown in the address bar while the screen is open, so GA4 and Meta can count it by URL.
const STEP_PARAM = 'step'
const STEP_VALUE = 'thank-you'

/** True when the page was opened at ?step=thank-you — the screen opens straight away. */
export function isThankYouUrl() {
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get(STEP_PARAM) === STEP_VALUE
  )
}

/** Sets or clears ?step=thank-you without reloading, keeping any other params (e.g. ?ref=). */
function setStepParam(on: boolean, mode: 'push' | 'replace') {
  const url = new URL(window.location.href)
  if ((url.searchParams.get(STEP_PARAM) === STEP_VALUE) === on) return
  if (on) url.searchParams.set(STEP_PARAM, STEP_VALUE)
  else url.searchParams.delete(STEP_PARAM)
  window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url)
}

/** "You're in" modal: after a prediction is locked, after joining, or at ?step=thank-you.
 *  Without a locked prediction (`pickedSide` null) it speaks to the waitlist alone. */
export default function ThankYouModal({
  open,
  pickedSide,
  founder,
  closesClock,
  grandPrizeLabel,
  referralPoints,
  onClose,
  onPredictAnother,
}: ThankYouModalProps) {
  useEffect(() => {
    if (!open) return
    setStepParam(true, 'push')
    // The browser's back button leaves the step, so close the screen with it.
    const onPopState = () => onClose()
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      setStepParam(false, 'replace')
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='thank-you-title'
      className='fixed inset-0 z-999 flex items-center justify-center p-4'
    >
      <div
        aria-hidden='true'
        onClick={onClose}
        className='absolute inset-0 bg-[#000]/60 backdrop-blur-sm'
      />

      {/* *:shrink-0 keeps sections at full height so a short screen scrolls instead of clipping them. */}
      <div className='animate-slide-up modal-scroll relative flex max-h-[90dvh] w-full max-w-100 flex-col *:shrink-0 sm:max-w-140 sm:px-7 items-center overflow-y-auto rounded-2xl border border-border bg-surface px-5 pt-6 pb-5 text-center shadow-[0_20px_60px_rgb(0_0_0/0.45)]'>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors hover:bg-border hover:text-foreground'
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} />
        </button>

        <div className='animate-scale-in relative mt-2 mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-success bg-success/10 text-success shadow-[0_0_32px_rgb(22_163_74/0.3)]'>
          <span
            aria-hidden='true'
            className='animate-ring-pulse absolute -inset-2 rounded-full border-2 border-success/25'
          />
          <HugeiconsIcon icon={Tick02Icon} size={30} strokeWidth={2.5} />
        </div>

        <h2
          id='thank-you-title'
          className='animate-gradient-text mb-1.5 bg-linear-135 from-dark via-success to-dark text-2xl font-extrabold tracking-[-0.02em] dark:from-lime dark:via-success dark:to-lime'
        >
          {pickedSide ? <>You&apos;re in. Prediction locked.</> : <>You&apos;re in.</>}
        </h2>
        <p className='mb-5 max-w-75 text-sm text-muted sm:max-w-110'>
          {pickedSide ? (
            <>
              Your {pickedSide.toUpperCase()} prediction is saved and you&apos;re on the
              SantiBet waitlist. Come back for the next question.
            </>
          ) : (
            <>
              You&apos;re on the SantiBet waitlist. Make today&apos;s prediction to start
              earning Founder Points.
            </>
          )}
        </p>

        <div
          className={`mb-5 grid w-full gap-2 ${founder ? 'grid-cols-3' : 'mx-auto max-w-40 grid-cols-1'}`}
        >
          {founder && (
            <>
              <Stat
                label='Founder No.'
                value={`#${founder.participantNumber.toLocaleString()}`}
              />
              <Stat
                label='Rank'
                value={founder.rank != null ? `#${founder.rank.toLocaleString()}` : '—'}
              />
            </>
          )}
          <Stat label='Closes in' value={closesClock} />
        </div>

        {founder && (
          <div className='relative mb-4 w-full rounded-2xl border border-lime/40 bg-surface-2 p-3.5 text-left shadow-[0_0_24px_rgb(191_250_0/0.08)]'>
            <div className='mb-2.5 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-dark uppercase dark:text-lime'>
              <HugeiconsIcon icon={Share08Icon} size={14} />
              Share &amp; Earn
              {referralPoints ? ` +${referralPoints} Points` : ' Founder Points'}
            </div>
            <ShareReferral referralCode={founder.referralCode} source='market' />
          </div>
        )}

        <div className='mb-5 w-full rounded-2xl border border-border bg-surface-2 p-3.5 text-left'>
          <div className='mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-dark uppercase dark:text-lime'>
            <HugeiconsIcon icon={SparklesIcon} size={14} />
            Rewards
          </div>
          <p className='text-sm leading-relaxed text-foreground'>
            Correct predictions earn Founder Points. Play daily, climb the ranks, and
            qualify for the{' '}
            <strong className='font-extrabold text-dark dark:text-lime'>
              {grandPrizeLabel}
            </strong>{' '}
            launch draw.
          </p>
        </div>

        <button type='button' onClick={onClose} className={primaryButtonClass(true)}>
          Back to the Question
        </button>
        <button
          type='button'
          onClick={() => {
            onClose()
            onPredictAnother()
          }}
          className={`mt-3.5 ${BACK_LINK_CLASS}`}
        >
          Predicting for someone else on this device? Use another number
        </button>
      </div>
    </div>,
    document.body,
  )
}
