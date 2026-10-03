'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { Icon, type IconName } from './icons'
import {
  useActiveCampaign,
  useCampaignActivityStream,
} from '../hooks/useCampaign'
import { formatMoney } from '../utils/money'
import type { ActivityToasts } from '../types/campaign'

/** One sentence per kind: the player when it's a single event, the count when it's several. */
function toastMessages({ joined, climbed, won }: ActivityToasts) {
  const messages: { icon: IconName; text: string }[] = []

  if (joined.count === 1 && joined.latest) {
    messages.push({ icon: 'rocket', text: `${joined.latest} just joined the waitlist` })
  } else if (joined.count > 0) {
    messages.push({
      icon: 'rocket',
      text: `${joined.count} ${joined.count === 1 ? 'person' : 'people'} just joined the waitlist`,
    })
  }

  if (climbed.count === 1 && climbed.latest && climbed.rank != null) {
    messages.push({ icon: 'star', text: `${climbed.latest} just climbed to #${climbed.rank}` })
  } else if (climbed.count > 0) {
    messages.push({
      icon: 'star',
      text: `${climbed.count} ${climbed.count === 1 ? 'player' : 'players'} just broke into the top ten`,
    })
  }

  if (won.count === 1 && won.latest && won.prizeName) {
    const amount = won.amount ? ` (${formatMoney(won.amount)})` : ''
    messages.push({ icon: 'trophy', text: `${won.latest} just won ${won.prizeName}${amount}` })
  } else if (won.count > 0) {
    messages.push({
      icon: 'trophy',
      text: `${won.count} ${won.count === 1 ? 'winner was' : 'winners were'} just drawn`,
    })
  }

  return messages
}

function showToasts(toasts: ActivityToasts) {
  toastMessages(toasts).forEach(({ icon, text }) =>
    toast(text, { icon: <Icon name={icon} className='h-4 w-4' /> }),
  )
}

/** Dev only: fires a sample `toasts` frame so the toasts can be seen without backend activity. */
function demoToasts(mode: 'single' | 'many' = 'single') {
  const many = mode === 'many'
  showToasts({
    asOf: new Date().toISOString(),
    joined: { count: many ? 12 : 1, latest: '+234******2474' },
    climbed: { count: many ? 3 : 1, latest: '+234******8812', rank: 4 },
    won: {
      count: many ? 5 : 1,
      latest: '+234******1093',
      prizeName: 'Daily airtime',
      amount: { amount: '100000', currency: 'NGN' },
    },
  })
}

/** Opens the campaign's live activity stream for the page: feeds the ticker and shows toasts. */
export default function LiveActivityToasts() {
  const { activeCampaign } = useActiveCampaign()
  useCampaignActivityStream(activeCampaign?.slug, showToasts)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const w = window as typeof window & { santibetDemoToasts?: typeof demoToasts }
    w.santibetDemoToasts = demoToasts
    return () => {
      delete w.santibetDemoToasts
    }
  }, [])

  return null
}
