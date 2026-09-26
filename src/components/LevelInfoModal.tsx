'use client'

import Modal from './Modal'
import type { CampaignLevel, ScoringRules } from '../types/campaign'

type LevelInfoModalProps = {
  open: boolean
  onClose: () => void
  levels: CampaignLevel[]
  selectedKey: string | null
  scoring?: ScoringRules
  myPoints?: number
}

// Copy for each tier, keyed by the level key set in admin. A key without an
// entry here falls back to a generic description built from its threshold.
const LEVEL_COPY: Record<string, string> = {
  rookie:
    'The first rung on the ladder. Rookies have locked in their Founder number and made their first calls.',
  rising:
    'You keep showing up. Rising Founders predict regularly and are starting to pull away from the pack.',
  insider:
    'You have been showing up and making calls. Insiders are getting a feel for how the crowd thinks.',
  pro: 'Your calls land more often than not. Pro Founders back their predictions with more than luck.',
  analyst:
    'You read the gist before you pick a side. Analysts back their predictions with more than luck.',
  elite:
    'Few Founders make it this far. Elite Founders combine sharp calls with streaks and referrals.',
  strategist:
    'You play the long game — streaks, referrals and consistent calls. Strategists are closing in on the top.',
  legend:
    'The top of the ladder. Legendary Founders have called it right more often than almost anyone on the board.',
  oracle:
    'The top of the ladder. Oracles have called it right more often than almost anyone else on the board.',
}

function pts(n: number) {
  return `${n.toLocaleString()} pt${n === 1 ? '' : 's'}`
}

export default function LevelInfoModal({
  open,
  onClose,
  levels,
  selectedKey,
  scoring,
  myPoints,
}: LevelInfoModalProps) {
  const index = levels.findIndex((l) => l.key === selectedKey)
  const level = levels[index]
  if (!level) return null

  const next = levels[index + 1]
  const isTop = !next
  const isStart = level.minPoints === 0
  const description =
    LEVEL_COPY[level.key] ??
    `${level.name} is level ${index + 1} of ${levels.length} on the Founder ladder.`

  const earnWays = scoring
    ? [
        scoring.pointsPerCorrectPrediction > 0 &&
          `${pts(scoring.pointsPerCorrectPrediction)} for every correct prediction`,
        scoring.pointsPerPrediction > 0 &&
          `${pts(scoring.pointsPerPrediction)} just for making a prediction`,
        scoring.pointsPerReferral > 0 &&
          `${pts(scoring.pointsPerReferral)} for every friend you refer`,
        scoring.pointsForJoining > 0 &&
          `${pts(scoring.pointsForJoining)} for joining the waitlist`,
      ].filter((w): w is string => Boolean(w))
    : []

  const toGo = myPoints != null ? level.minPoints - myPoints : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={level.name}
      subtitle={`Level ${index + 1} of ${levels.length} · ${level.minPoints.toLocaleString()}+ pts`}
    >
      <div className='flex flex-col gap-5 text-sm leading-6 text-muted'>
        <section>
          <h4 className='mb-1.5 font-display text-base font-black text-ink'>
            Who is a{/^[aeiou]/i.test(level.name) ? 'n' : ''} {level.name}?
          </h4>
          <p>{description}</p>
        </section>

        <section>
          <h4 className='mb-1.5 font-display text-base font-black text-ink'>
            How to get there
          </h4>
          <p>
            {isStart
              ? 'Automatic — you become a Rookie the moment you join the waitlist.'
              : `Reach ${pts(level.minPoints)} and you move up to ${level.name} automatically.`}
            {!isTop &&
              ` Hit ${pts(next.minPoints)} to move up to ${next.name}.`}
            {isTop && ' This is the highest tier — there is nowhere left to climb.'}
          </p>
          {toGo != null && (
            <p className='mt-2 font-bold text-ink'>
              {toGo > 0
                ? `You have ${pts(myPoints!)} — ${pts(toGo)} to go.`
                : `You have ${pts(myPoints!)} — you've already reached this tier.`}
            </p>
          )}
        </section>

        {earnWays.length > 0 && (
          <section>
            <h4 className='mb-1.5 font-display text-base font-black text-ink'>
              Ways to earn points
            </h4>
            <ul className='list-disc space-y-1 pl-5'>
              {earnWays.map((way) => (
                <li key={way}>{way}</li>
              ))}
            </ul>
          </section>
        )}

        <section className='border-t border-dashed border-border pt-4'>
          <h4 className='mb-1.5 font-display text-base font-black text-ink'>
            What is a Founder?
          </h4>
          <p>
            Anyone who joins the SantiBet waitlist before launch. Every Founder
            gets a permanent Founder number and the Founder perks — your tier
            shows how far you have climbed.
          </p>
        </section>
      </div>
    </Modal>
  )
}
