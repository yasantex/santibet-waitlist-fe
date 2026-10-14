'use client'

import Modal from './Modal'
import PointsRules from '../PointsRules'

export default function HowToPlayModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title='How to Play'
      subtitle='Pick YES or NO before the timer ends. Points move you up the leaderboard.'
      maxWidth='max-w-100'
    >
      <PointsRules />
    </Modal>
  )
}
