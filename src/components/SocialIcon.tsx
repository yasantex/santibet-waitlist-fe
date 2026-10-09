import type { SocialName } from '../utils/constants'

// Stroke-style marks to match the outline icons in ./icons.
const PATHS: Record<SocialName, React.ReactNode> = {
  instagram: (
    <>
      <rect x='3' y='3' width='18' height='18' rx='5' />
      <circle cx='12' cy='12' r='4' />
      <circle cx='17.5' cy='6.5' r='0.6' fill='currentColor' />
    </>
  ),
  x: <path d='M4 4l16 16M20 4 4 20' />,
  tiktok: (
    <path d='M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.8 2.3 4.5 5 4.8' />
  ),
  facebook: (
    <path d='M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15V3Z' />
  ),
  linkedin: (
    <>
      <rect x='3' y='3' width='18' height='18' rx='3' />
      <path d='M8 10.5V16M8 7.5v.01M11.5 16v-5.5M11.5 13c0-1.7 1-2.7 2.3-2.7 1.4 0 2.2.9 2.2 2.7V16' />
    </>
  ),
}

export default function SocialIcon({
  name,
  className = 'h-5 w-5',
}: {
  name: SocialName
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
