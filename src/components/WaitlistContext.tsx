'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import type { WaitlistSource } from '../utils/constants'
import { focusQuestionCard } from '../utils/page'
import { useActiveCampaign } from '../hooks/useCampaign'
import { useAppSelector } from '../redux/hooks'
import { selectHasVerifiedDevice } from '../redux/campaignSlice'
import WaitlistModal from './modals/WaitlistModal'

const WaitlistContext = createContext<((source: WaitlistSource) => void) | null>(null)

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
    if (hasModal && !verified) setSource('auto')
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

  function handleJoined(alreadyJoined: boolean) {
    setSource(null)
    toast(
      alreadyJoined
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
    <WaitlistContext.Provider value={openWaitlist}>
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
  const open = useContext(WaitlistContext)
  if (!open) throw new Error('useOpenWaitlist must be used inside WaitlistProvider')
  return open
}
