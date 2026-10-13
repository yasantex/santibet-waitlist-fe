import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

export default function SectionTitle({
  icon,
  children,
  className = '',
}: {
  icon: IconSvgElement
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`mb-2.5 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-dark uppercase dark:text-lime ${className}`}
    >
      <HugeiconsIcon icon={icon} size={14} />
      {children}
    </div>
  )
}

export function PanelMessage({ children }: { children: React.ReactNode }) {
  return <div className='py-6 text-center text-sm text-muted'>{children}</div>
}
