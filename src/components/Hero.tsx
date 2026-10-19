'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { UserAdd01Icon } from '@hugeicons/core-free-icons'
import { trackEvent } from '../utils/constants'
import { useOpenWaitlist } from './WaitlistContext'
import { primaryButtonClass } from './market-card/utils'

export default function Hero() {
  const openWaitlist = useOpenWaitlist()

  return (
    <button
      type='button'
      onClick={() => {
        openWaitlist('cta')
        trackEvent({ event: 'cta_click', cta_name: 'hero_join_waitlist' })
      }}
      className={`${primaryButtonClass(true)} h-20! gap-3 rounded-2xl! text-lg! uppercase lg:min-h-20 lg:flex-1 lg:gap-4 lg:rounded-3xl! lg:text-4xl!`}
    >
      <HugeiconsIcon
        icon={UserAdd01Icon}
        size={26}
        strokeWidth={2}
        className='lg:size-10'
      />
      Join the Waitlist
    </button>
  )
}
