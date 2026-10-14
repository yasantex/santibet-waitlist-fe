'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Share08Icon, WhatsappIcon } from '@hugeicons/core-free-icons'
import { trackEvent } from '../../utils/constants'
import { referralLink } from '../../utils/page'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

const SHARE_TEXT =
  'I just made my SantiBet prediction — join me and we both earn Founder points:'

interface ShareReferralProps {
  referralCode: string
  /** Prefix for the analytics cta_name, e.g. "market" → "market_copy_link". */
  source: string
  /** Also show the WhatsApp and native share buttons under the link. */
  withShareButtons?: boolean
}

/** Referral link with a Copy button, plus optional WhatsApp / Share buttons. */
export default function ShareReferral({
  referralCode,
  source,
  withShareButtons = true,
}: ShareReferralProps) {
  const { copied, copy } = useCopyToClipboard()
  const link = referralLink(referralCode)
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${link}`)}`

  function handleCopy() {
    copy(link)
    trackEvent({ event: 'referral_link_copied', cta_name: `${source}_copy_link` })
  }

  async function handleShare() {
    trackEvent({
      event: 'referral_share_click',
      cta_name: `${source}_share`,
      share_channel: 'native',
    })
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SantiBet', text: SHARE_TEXT, url: link })
      } catch {
        // share sheet dismissed — nothing to do
      }
    } else {
      copy(link)
    }
  }

  return (
    <div>
      <div className='flex items-center gap-2'>
        <div className='min-w-0 flex-1 truncate rounded-lg border border-border bg-[#000]/5 px-3 py-2 text-xs font-medium text-muted tabular-nums dark:bg-[#000]/25'>
          {link}
        </div>
        <button
          type='button'
          onClick={handleCopy}
          className={`btn-lift shrink-0 rounded-lg px-3.5 py-2 text-[11px] font-bold tracking-[0.03em] uppercase ${
            copied ? 'bg-success text-white' : 'bg-lime text-lime-ink hover:bg-[#cfff3d]'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {withShareButtons && (
        <div className='mt-2 flex gap-2'>
          <a
            href={whatsappHref}
            target='_blank'
            rel='noreferrer'
            onClick={() =>
              trackEvent({
                event: 'referral_share_click',
                cta_name: `${source}_whatsapp`,
                share_channel: 'whatsapp',
              })
            }
            className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-success/50 bg-success/10 px-3 py-2 text-xs font-semibold text-success hover:bg-success hover:text-white'
          >
            <HugeiconsIcon icon={WhatsappIcon} size={15} />
            WhatsApp
          </a>
          <button
            type='button'
            onClick={handleShare}
            className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:border-dark dark:hover:border-lime'
          >
            <HugeiconsIcon icon={Share08Icon} size={15} />
            Share
          </button>
        </div>
      )}
    </div>
  )
}
