const launchCountdown = {
  days: '80',
  hours: '00',
  mins: '00',
  secs: '00',
}

function FlipUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className='flex flex-col items-center gap-1 sm:gap-1.5'>
      <div className="relative w-11 rounded-md border border-line bg-navy-2 py-1.5 text-center font-mono text-[clamp(20px,7vw,40px)] font-bold text-paper after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/40 after:content-[''] sm:w-15 sm:py-2">
        {value}
      </div>
      <div className='font-mono text-[9px] tracking-[1px] text-slate uppercase sm:text-[10px] sm:tracking-[1.5px]'>
        {label}
      </div>
    </div>
  )
}

export default function CountdownTimer() {
  const { days, hours, mins, secs } = launchCountdown

  return (
    <div
      className='mx-auto mt-10 inline-flex max-w-full gap-1.5 rounded-[10px] border border-line bg-navy-1 px-3 py-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] sm:gap-2.5 sm:px-5.5 sm:py-4.5'
      aria-label='Countdown to SantiBet launch'
    >
      <FlipUnit value={days} label='Days' />
      <div className='self-center pb-4.5 font-mono text-base text-line sm:pb-5.5 sm:text-2xl'>
        :
      </div>
      <FlipUnit value={hours} label='Hrs' />
      <div className='self-center pb-4.5 font-mono text-base text-line sm:pb-5.5 sm:text-2xl'>
        :
      </div>
      <FlipUnit value={mins} label='Min' />
      <div className='self-center pb-4.5 font-mono text-base text-line sm:pb-5.5 sm:text-2xl'>
        :
      </div>
      <FlipUnit value={secs} label='Sec' />
    </div>
  )
}
