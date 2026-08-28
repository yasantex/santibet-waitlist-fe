export type IconName =
  | 'badge'
  | 'star'
  | 'trophy'
  | 'shield'
  | 'crown'
  | 'rocket'
  | 'gift'
  | 'ticket'
  | 'wallet'
  | 'confetti'

const PATHS: Record<IconName, React.ReactNode> = {
  badge: (
    <>
      <circle cx='12' cy='9' r='6' />
      <path d='m9 14-2 7 5-3 5 3-2-7' />
    </>
  ),
  star: (
    <path d='M12 3l2.6 5.9L21 9.6l-4.8 4.2 1.4 6.2L12 16.8l-5.6 3.2 1.4-6.2L3 9.6l6.4-.7L12 3Z' />
  ),
  trophy: (
    <>
      <path d='M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z' />
      <path d='M7 5H4a2 2 0 0 0 0 4h2M17 5h3a2 2 0 0 1 0 4h-2' />
    </>
  ),
  shield: (
    <>
      <path d='M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z' />
      <path d='m9 12 2 2 4-4' />
    </>
  ),
  crown: (
    <>
      <path d='M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8Z' />
      <path d='M5 19h14' />
    </>
  ),
  rocket: (
    <>
      <path d='M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10Z' />
      <circle cx='12' cy='10' r='2' />
      <path d='M8 17l-3 3M16 17l3 3M9 20l1 2M15 20l-1 2' />
    </>
  ),
  gift: (
    <>
      <rect x='3' y='9' width='18' height='12' rx='1' />
      <path d='M3 9h18M12 9v12M12 9C10 4 4 5 5 8c.5 1.3 3.5 1 7 1ZM12 9c2-5 8-4 7-1-.5 1.3-3.5 1-7 1Z' />
    </>
  ),
  ticket: (
    <>
      <path d='M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z' />
      <path d='M14 6v12' strokeDasharray='2 3' />
    </>
  ),
  wallet: (
    <>
      <path d='M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z' />
      <path d='M17 12h2M13 5V3a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2v3' />
    </>
  ),
  confetti: (
    <>
      <path d='m4 20 4-14M9 20l3-12M14 20l2-10M4 5l16 3M4 10l14 1' />
      <circle cx='19' cy='6' r='1' />
      <circle cx='6' cy='16' r='1' />
    </>
  ),
}

export function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      {PATHS[name]}
    </svg>
  )
}
