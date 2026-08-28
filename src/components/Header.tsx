import Image from 'next/image'

export default function Header() {
  return (
    <header className='sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-270 items-center justify-between gap-4 px-6 py-2.5'>
        <Image
          src='/Santibet Logo.svg'
          alt='SantiBet'
          width={100}
          height={38}
          className='h-11 shrink-0 dark:invert'
          priority
        />
        <a
          href='#market'
          className='shrink-0 font-outfit! rounded-full w-fit bg-lime px-4 py-1.5 text-base font-semibold text-lime-ink dark:text-[#10230a]! '
        >
          Predict now
        </a>
      </div>
    </header>
  )
}
