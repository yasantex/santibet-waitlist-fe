'use client'

import Image from 'next/image'
import { trackEvent } from '../utils/analytics'

export default function Header() {
  function handleLogoClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className='sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-270 items-center justify-between gap-4 px-6 py-2.5'>
        <button
          type='button'
          onClick={handleLogoClick}
          aria-label='Scroll to top'
          className='shrink-0 cursor-pointer transition-opacity hover:opacity-80 active:opacity-60'
        >
          <Image
            src='/Santibet Logo.svg'
            alt='SantiBet'
            width={100}
            height={38}
            className='h-11 shrink-0 dark:invert'
            priority
          />
        </button>
        <a
          href='#market'
          onClick={() => trackEvent({ event: 'cta_click', cta_name: 'header_predict_now' })}
          className='btn-lift shrink-0 font-outfit! rounded-full w-fit bg-lime px-4 py-1.5 text-sm sm:text-base font-semibold text-lime-ink hover:bg-[#cfff3d] dark:text-[#10230a]!'
        >
          Make Today&apos;s Prediction
        </a>
      </div>
    </header>
  )
}
