import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon } from '@hugeicons/core-free-icons'

export default function ErrorText({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role='alert'
      className={`flex items-center justify-center gap-1.5 text-center text-xs font-medium text-error ${className}`}
    >
      <HugeiconsIcon icon={Alert02Icon} size={14} className='shrink-0' />
      {children}
    </div>
  )
}
