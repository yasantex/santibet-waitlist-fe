'use client'

import { useState } from 'react'
import CountdownTimer from './CountdownTimer'
import { Icon } from './icons'
import WaitlistRulesModal from './WaitlistRulesModal'
import {
  useActiveCampaign,
  useCampaignStats,
  useCampaignRules,
  useMe,
} from '../hooks/useCampaign'
import { formatMoney, trackEvent } from '../utils/constants'
import { useAppSelector } from '../redux/hooks'

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

function ShareIcon() {
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
      <circle cx='18' cy='5' r='2.5' />
      <circle cx='6' cy='12' r='2.5' />
      <circle cx='18' cy='19' r='2.5' />
      <path d='m8.2 10.7 7.6-4.4M8.2 13.3l7.6 4.4' />
    </svg>
  )
}

export default function Hero() {
  const { activeCampaign } = useActiveCampaign()
  const { data: stats } = useCampaignStats(activeCampaign?.slug)
  const { data: rules } = useCampaignRules(activeCampaign?.slug)
  const { data: meStanding } = useMe(activeCampaign?.slug)
  const cachedStanding = useAppSelector((s) => s.campaign.standing)
  const standing = meStanding ?? cachedStanding
  const [copied, setCopied] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  const prizePool = stats?.dailyPrizePool?.[0]
  const prizePoolLabel = prizePool ? formatMoney(prizePool) : '—'

  const launchHeadlineTier = rules?.prizes
    .find((p) => p.period === 'LAUNCH')
    ?.tiers.slice()
    .sort((a, b) => a.place - b.place)[0]
  // Falls back to the static figure until /rules loads — this is a hero
  // one-liner, not worth a loading-state layout shift.
  const grandPrizeLabel = launchHeadlineTier
    ? formatMoney(launchHeadlineTier.amount, { compact: true })
    : '₦1M'
  const predictedLabel = (
    stats?.today?.predictions ??
    stats?.totalPredictions ??
    0
  ).toLocaleString()
  const yesPercent = stats?.today?.yesPercent
  const noPercent = yesPercent != null ? 100 - yesPercent : null

  const referLink =
    standing && typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${standing.referralCode}`
      : ''
  const shareText =
    'Join me on SantiBet’s pre-launch waitlist — predict daily and stack Founder points before we launch.'
  const whatsappHref = referLink
    ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referLink}`)}`
    : undefined

  function handleCopyClick() {
    handleCopy()
    trackEvent({ event: 'referral_link_copied', cta_name: 'hero_copy_link' })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referLink)
    } catch {
      // clipboard API unavailable — ignore, the input remains selectable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleShare() {
    if (!referLink) return
    trackEvent({ event: 'referral_share_click', cta_name: 'hero_share', share_channel: 'native' })
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'SantiBet', text: shareText, url: referLink })
      } catch {
        // user cancelled the share sheet — no-op
      }
    } else {
      handleCopy()
    }
  }

  const tickerItems = [
    'Predict Daily',
    'Earn Points',
    'Climb the Ranks',
    'Unlock Rewards',
  ]

  return (
    <>
      <div className='mx-auto max-w-270 px-3 py-16 sm:px-6 sm:py-20'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-12 lg:gap-16'>
          {/* Left column */}
          <div className='flex flex-col items-center gap-5 text-center md:items-start md:text-left'>
            <div className='inline-flex items-center gap-2 font-bold uppercase tracking-[0.06em] rounded-full border-[1.5px] border-dark px-4 py-1.75 text-xs text-dark dark:border-lime dark:text-lime'>
              <span className='animate-pulse-dot h-1.75 w-1.75 rounded-full bg-success' />
              Pre-launch · New Predictions Daily
            </div>

            <h1 className='max-w-230 px-5 font-display italic text-[clamp(35px,8.5vw,72px)] leading-[0.94] font-black tracking-[-0.02em] text-ink uppercase md:px-0'>
              Predict.  Win. <br className='md:block hidden' />
              <span className='text-dark dark:text-lime'>Repeat.</span>
            </h1>

            <div className='-rotate-2 mt-1'>
              <span className='inline-block rounded-md bg-lime px-6 py-2.5 font-display italic text-lg sm:text-xl font-black tracking-[-0.01em] text-lime-ink shadow-[4px_4px_0_var(--color-dark)] dark:shadow-[4px_4px_0_var(--color-surface-2)]'>
                No deposit. No payment required.
              </span>
            </div>

            <p className='max-w-125 px-2 text-base text-muted font-medium md:px-0'>
              Make predictions, earn Founder Points, and get closer to{' '}
              <strong className='text-ink font-bold'>{grandPrizeLabel}.</strong>
            </p>
            <div className='w-full max-w-110 rounded-2xl border border-border bg-surface px-5 py-3.5 text-left'>
              <div className='mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted'>
                Today&apos;s Prediction
              </div>
              <div className='grid grid-cols-[repeat(4,auto)] justify-between gap-2 divide-x divide-border sm:grid-cols-4 sm:gap-3'>
                <div>
                  <div className='text-lg font-black text-ink sm:text-xl'>{prizePoolLabel}</div>
                  <div className='text-xs font-semibold text-muted'>Prize Pool</div>
                </div>
                <div className='pl-2 sm:pl-3'>
                  <div className='text-lg font-black text-ink sm:text-xl'>{predictedLabel}</div>
                  <div className='text-xs font-semibold text-muted'>Predictions</div>
                </div>
                <div className='pl-2 sm:pl-3'>
                  <div className='text-lg font-black text-success sm:text-xl'>
                    {yesPercent != null ? `${yesPercent}%` : '—'}
                  </div>
                  <div className='text-xs font-semibold text-muted'>YES</div>
                </div>
                <div className='pl-2 sm:pl-3'>
                  <div className='text-lg font-black text-error sm:text-xl'>
                    {noPercent != null ? `${noPercent}%` : '—'}
                  </div>
                  <div className='text-xs font-semibold text-muted'>NO</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className='flex flex-col items-center gap-3.5 md:items-stretch md:pt-1'>
            <CountdownTimer />

            <div className='flex flex-col gap-2.5 items-center w-full max-w-100 md:max-w-none'>
              <a
                href='#market'
                onClick={() => trackEvent({ event: 'cta_click', cta_name: 'hero_predict_now' })}
                className='btn-3d shrink-0 w-full text-center rounded-2xl bg-lime px-8 py-4.5 text-lg font-black text-lime-ink sm:px-10 sm:text-xl dark:text-[#10230a]!'
              >
                Make Today&apos;s Prediction →
              </a>
              <div className='text-center text-[11px] font-medium text-muted'>
                By continuing, you agree to our{' '}
                <button
                  type='button'
                  onClick={() => {
                    setRulesOpen(true)
                    trackEvent({ event: 'rules_opened', cta_name: 'hero_rules_link' })
                  }}
                  className='link-action font-bold text-dark dark:text-lime'
                >
                  Waitlist &amp; Prediction Rules
                </button>
                .
              </div>
            </div>

            {standing ? (
              <div className='relative w-full max-w-110 md:max-w-none rounded-2xl border-[1.5px] border-dark bg-surface px-5 pt-5 pb-4 text-left dark:border-lime'>
                <span className='absolute -top-3 left-4 rounded-full bg-lime px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.05em] text-lime-ink'>
                  Founder Rewards
                </span>
                <div className='flex items-center gap-3.5 mb-3.5'>
                  <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-xl bg-dark dark:bg-lime'>
                    <Icon
                      name='crown'
                      className='h-6.5 w-6.5 text-lime dark:text-lime-ink'
                    />
                  </div>
                  <div>
                    <div className='text-sm font-black text-ink'>
                      You&apos;re Founder #
                      {standing.participantNumber.toLocaleString()}
                    </div>
                    <div className='mt-0.5 text-xs font-medium text-muted'>
                      {standing.rank != null
                        ? `Currently ranked #${standing.rank.toLocaleString()}`
                        : 'Predict daily to climb the board'}
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <input
                    readOnly
                    value={referLink}
                    aria-label='Your referral link'
                    className='min-w-0 flex-1 rounded-lg border border-border bg-paper px-3 py-2.5 text-xs text-placeholder'
                  />
                  <button
                    type='button'
                    onClick={handleCopyClick}
                    className='btn-lift shrink-0 rounded-lg bg-lime px-4 py-2.5 text-xs font-black text-lime-ink hover:bg-[#cfff3d]'
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                <div className='mt-2 flex gap-2'>
                  <a
                    href={whatsappHref}
                    target='_blank'
                    rel='noreferrer'
                    onClick={() =>
                      trackEvent({
                        event: 'referral_share_click',
                        cta_name: 'hero_whatsapp',
                        share_channel: 'whatsapp',
                      })
                    }
                    className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-success bg-success/10 px-3 py-2.5 text-xs font-bold text-success hover:bg-success hover:text-white dark:hover:text-lime-ink'
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                  <button
                    type='button'
                    onClick={handleShare}
                    className='btn-lift flex flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-border bg-surface px-3 py-2.5 text-xs font-bold text-ink hover:border-dark hover:bg-surface-2 dark:hover:border-lime'
                  >
                    <ShareIcon />
                    Share
                  </button>
                </div>
              </div>
            ) : (
              <div className='relative flex items-center gap-3.5 w-full max-w-110 md:max-w-none rounded-2xl border-[1.5px] border-dark bg-surface px-5 pt-5 pb-4 text-left dark:border-lime'>
                <span className='absolute -top-3 left-4 rounded-full bg-lime px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.05em] text-lime-ink'>
                  Founder Rewards
                </span>
                <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-xl bg-dark dark:bg-lime'>
                  <Icon
                    name='crown'
                    className='h-6.5 w-6.5 text-lime dark:text-lime-ink'
                  />
                </div>
                <div>
                  <div className='text-sm font-black text-ink'>
                    Predict. Earn Points. Unlock Rewards.
                  </div>
                  <div className='mt-0.5 text-xs font-medium text-muted leading-relaxed'>
                    Get your Founder Badge, earn points, unlock rewards and get priority access before launch.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='w-full overflow-hidden bg-lime py-3.5'>
        <div className='flex w-max animate-ticker gap-7 whitespace-nowrap text-xs font-black uppercase tracking-[0.03em] text-lime-ink'>
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map(
            (item, i) => (
              <span key={i} className="after:content-['•'] after:ml-7">
                {item}
              </span>
            ),
          )}
        </div>
      </div>

      <WaitlistRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  )
}
