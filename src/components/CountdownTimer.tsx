const launchCountdown = {
  days: '80',
  hours: '00',
  mins: '00',
  secs: '00',
}

function FlipUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className='flex flex-col items-center gap-1.5'>
      <div className='relative w-11 rounded-md bg-white py-1.5 text-center f text-[clamp(20px,7vw,36px)] font-semibold text-black sm:w-17 sm:py-2'>
        {value}
      </div>
      <div className='text-[10px]  text-neutral-10  font-medium'>{label}</div>
    </div>
  )
}

export default function CountdownTimer() {
  const { days, hours, mins, secs } = launchCountdown

  return (
    <div
      className='mx-auto inline-block max-w-full rounded-2xl border border-dashed border-border bg-plain px-5 py-4 sm:px-6'
      aria-label='Countdown to SantiBet launch'
    >
      <div className='mb-3 text-xs font-medium text-neutral-10 '>
        Launch T-Minus
      </div>
      <div className='inline-flex max-w-full gap-1.5 sm:gap-2.5'>
        <FlipUnit value={days} label='Days' />
        <div className='self-center pb-4.5 font-mono text-base text-neutral-10 sm:pb-5.5 sm:text-2xl'>
          :
        </div>
        <FlipUnit value={hours} label='Hrs' />
        <div className='self-center pb-4.5 font-mono text-base text-neutral-10 sm:pb-5.5 sm:text-2xl'>
          :
        </div>
        <FlipUnit value={mins} label='Min' />
        <div className='self-center pb-4.5 font-mono text-base text-neutral-10 sm:pb-5.5 sm:text-2xl'>
          :
        </div>
        <FlipUnit value={secs} label='Sec' />
      </div>
    </div>
  )
}
