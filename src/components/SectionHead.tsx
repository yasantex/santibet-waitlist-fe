export default function SectionHead({
  kicker,
  title,
  subtitle,
}: {
  kicker: string
  title: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className='flex flex-col items-center justify-center mb-11 text-center'>
      <div className='mb-4 flex items-center justify-center gap-2.5'>
        <span className='h-0.5 w-6 rounded-full bg-lime sm:w-8' />
        <span className='font-black text-xs uppercase tracking-[0.08em] text-dark dark:text-lime'>
          {kicker}
        </span>
        <span className='h-0.5 w-6 rounded-full bg-lime sm:w-8' />
      </div>
      <h2 className='md:text-[44px] text-center text-[32px] leading-8 md:leading-11.5 font-black italic max-w-110 text-ink'>
        {title}
      </h2>
      {subtitle && (
        <p className='mx-auto mt-3 max-w-125 text-[15.5px] leading-relaxed text-muted font-medium'>
          {subtitle}
        </p>
      )}
    </div>
  )
}
