export default function SectionHead({
  kicker,
  title,
  subtitle,
}: {
  kicker: string
  title: string
  subtitle?: string
}) {
  return (
    <div className='flex flex-col items-center justify-center mb-11 text-center'>
      <div className='mb-4 flex items-center justify-center   gap-3'>
        <span className='h-px w-8 bg-black sm:w-20' />
        <span className='font-extrabold text-base text-success '>
          {kicker}
        </span>
        <span className='h-px  w-8 bg-black sm:w-20' />
      </div>
      <h2 className='md:text-[44px] text-center text-[32px] leading-8 md:leading-11.5 font-extrabold max-w-110  text-black '>
        {title}
      </h2>
      {subtitle && (
        <p className='mx-auto mt-3 max-w-125 text-[15.5px] leading-relaxed text-placeholder'>
          {subtitle}
        </p>
      )}
    </div>
  )
}
