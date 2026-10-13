import { StarIcon } from '@hugeicons/core-free-icons'
import PointsRules from '../PointsRules'
import SectionTitle from './SectionTitle'

export default function PointsPanel() {
  return (
    <div>
      <SectionTitle icon={StarIcon}>How Points Work</SectionTitle>
      <PointsRules />
    </div>
  )
}
