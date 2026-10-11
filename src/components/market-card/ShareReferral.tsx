import { useState } from 'react'
import { trackEvent } from '../../utils/constants'

function WhatsAppIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M4 20l1.4-4.2A8 8 0 1 1 9 18.5L4 20Z' />
      <path d='M8.5 9.3c0 3.1 2.5 5.6 5.6 5.6' />
    </svg>
  )
}

export default function ShareReferral({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false)

  const referLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${referralCode}`
      : ''
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `I just made my SantiBet prediction — join me and we both earn Founder points: ${referLink}`,
  )}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referLink)
    } catch {
      // clipboard API unavailable — ignore, the input remains selectable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    trackEvent({ event: 'referral_link_copied', cta_name: 'market_copy_link' })
  }

  return (
    <>
      <div className='mb-3.5 flex items-center justify-center gap-2 rounded-full bg-surface-2 px-4 py-2.5 text-[12.5px] font-bold text-ink'>
        <span>🎯</span>
        Share your link — you both earn +5 Founder points
      </div>

      <div className='mb-3.5 flex items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-border px-3.5 py-3'>
        <div className='min-w-0 flex-1 truncate text-left text-[12.5px] font-bold text-ink'>
          {referLink}
        </div>
        <button
          type='button'
          onClick={handleCopy}
          className={`btn-lift shrink-0 rounded-lg px-3.5 py-2 text-[11.5px] font-black ${
            copied
              ? 'bg-success text-white'
              : 'bg-dark text-white hover:bg-dark-2 dark:bg-lime dark:text-lime-ink dark:hover:bg-[#cfff3d]'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className='flex gap-2'>
        <a
          href={whatsappHref}
          target='_blank'
          rel='noreferrer'
          onClick={() =>
            trackEvent({
              event: 'referral_share_click',
              cta_name: 'market_whatsapp',
              share_channel: 'whatsapp',
            })
          }
          className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-success bg-success/10 px-3 py-3 text-[12.5px] font-bold text-success hover:bg-success hover:text-white dark:hover:text-lime-ink'
        >
          <WhatsAppIcon />
          WhatsApp
        </a>
        <button
          type='button'
          onClick={handleCopy}
          className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface px-3 py-3 text-[12.5px] font-bold text-ink hover:border-dark hover:bg-surface-2 dark:hover:border-lime'
        >
          🔗 Copy Link
        </button>
      </div>
    </>
  )
}
