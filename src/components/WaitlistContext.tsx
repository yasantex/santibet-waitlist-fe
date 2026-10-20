'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { trackEvent, type WaitlistSource } from '../utils/constants'
import { focusQuestionCard } from '../utils/page'
import { useActiveCampaign } from '../hooks/useCampaign'
import { useAppSelector } from '../redux/hooks'
import { selectHasVerifiedDevice } from '../redux/campaignSlice'
import WaitlistModal from './modals/WaitlistModal'
import { isThankYouUrl } from './modals/ThankYouModal'

interface WaitlistContextValue {
  openWaitlist: (source: WaitlistSource) => void
  /** Bumped each time a new signup should see the thank-you screen. */
  thankYouRequests: number
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null)

/**
 * Owns the join modal. A campaign only has one when `joinRequiresPrediction` is false; then it
 * opens on arrival for a device that hasn't verified here yet, and from the Join CTAs.
 * Otherwise predicting is the only way in, so the CTAs point at the question instead.
 */
export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  // Settings come from the live campaign (refetched, not cached), since ops can flip them.
  const { activeCampaign } = useActiveCampaign()
  const hasModal = activeCampaign?.joinRequiresPrediction === false
  const allowEmail = activeCampaign?.allowEmailJoin === true
  // PersistGate has rehydrated by now, so this reflects what the device remembers.
  const verified = useAppSelector(selectHasVerifiedDevice)

  const [source, setSource] = useState<WaitlistSource | null>(null)
  // Remounts the modal for each opening, so it starts with fresh state.
  const [openId, setOpenId] = useState(0)

  // Decide once, when the campaign first loads, whether to greet the visitor with the modal.
  const [arrivalChecked, setArrivalChecked] = useState(false)
  if (!arrivalChecked && activeCampaign) {
    setArrivalChecked(true)
    // Someone landing on ?step=thank-you sees that screen, not the join modal on top of it.
    if (hasModal && !verified && !isThankYouUrl()) setSource('auto')
  }

  const openWaitlist = useCallback(
    (next: WaitlistSource) => {
      if (!hasModal) {
        focusQuestionCard()
        return
      }
      setSource(next)
      setOpenId((id) => id + 1)
    },
    [hasModal],
  )
  const close = useCallback(() => setSource(null), [])
  const [thankYouRequests, setThankYouRequests] = useState(0)

  function handleJoined(alreadyJoined: boolean) {
    const addingNumber = source === 'add_number'
    setSource(null)
    // A new signup gets the thank-you screen (and its ?step=thank-you URL for GA4 / Meta).
    if (!alreadyJoined && !addingNumber) {
      setThankYouRequests((n) => n + 1)
      trackEvent({ event: 'thank_you_view', user_type: 'new' })
      return
    }
    toast(
      addingNumber
        ? "Number added. You're predicting with it now."
        : alreadyJoined
          ? "You're already on the list. Make today's prediction."
          : "You're on the waitlist! Make today's prediction.",
      { icon: <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} /> },
    )
    focusQuestionCard()
  }

  /** The campaign turned its join modal off mid-visit (403 JOIN_REQUIRES_PREDICTION). */
  function handleModalDisabled() {
    setSource(null)
    focusQuestionCard()
  }

  return (
    <WaitlistContext.Provider value={{ openWaitlist, thankYouRequests }}>
      {children}
      {source && hasModal && (
        <WaitlistModal
          key={openId}
          source={source}
          allowEmail={allowEmail}
          onClose={close}
          onJoined={handleJoined}
          onModalDisabled={handleModalDisabled}
        />
      )}
    </WaitlistContext.Provider>
  )
}

/** Opens the join modal, or points at the question when this campaign has none. */
export function useOpenWaitlist() {
  return useWaitlistContext().openWaitlist
}

/** Changes each time a signup through the modal should open the thank-you screen. */
export function useThankYouRequests() {
  return useWaitlistContext().thankYouRequests
}

function useWaitlistContext() {
  const value = useContext(WaitlistContext)
  if (!value) throw new Error('Waitlist hooks must be used inside WaitlistProvider')
  return value
}
