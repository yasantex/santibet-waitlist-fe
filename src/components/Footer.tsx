'use client'

import Image from 'next/image'
import { trackEvent, SUPPORT_EMAIL } from '../utils/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>


      <footer className='border-t border-border px-6 py-8 text-center flex flex-col items-center justify-center text-base gap-2.5 text-neutral-10'>
        <Image
          src='/Santibet Logo.svg'
          alt='SantiBet'
          width={120}
          height={50}
          className='h-13 shrink-0 dark:invert'
          priority
        />
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          onClick={() => trackEvent({ event: 'contact_us_click', cta_name: 'footer_email' })}
          className='link-action text-sm font-bold text-dark dark:text-lime'
        >
          {SUPPORT_EMAIL}
        </a>
        <div>©️ {year} Awa Lawa Limited · SantiBet is not yet live</div>
      </footer>
    </>
  )
}
