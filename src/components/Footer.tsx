import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <section className='pt-18 pb-14 text-center'>
        <div className='mx-auto max-w-270 px-6'>
          <div className='mb-3 text-xs font-black tracking-[0.1em] text-dark uppercase dark:text-lime'>
            Don&apos;t just wait
          </div>
          <h2 className='mx-auto max-w-160 font-display italic text-[clamp(28px,4.5vw,44px)] font-black tracking-[-0.01em] text-ink'>
            Make today&apos;s prediction.
          </h2>
          <p className='mx-auto mt-4 max-w-125 text-[16.5px] text-muted font-medium'>
            Every prediction before launch is a step toward Founder status and
            a shot at ₦1,000,000.
          </p>
          <div className='mt-8 flex flex-wrap justify-center gap-2.5'>
            <a
              href='#market'
              className='inline-block rounded-2xl bg-lime px-8 py-4 font-black text-lime-ink no-underline shadow-[0_6px_0_#8FC200] dark:text-[#10230a]!'
            >
              Predict Now →
            </a>
          </div>
          <div className='mt-4 text-[11px] font-bold tracking-[0.06em] text-muted uppercase'>
            No Registration &nbsp;·&nbsp; No Deposit &nbsp;·&nbsp; No Payment
            Required
          </div>
        </div>
      </section>

      <footer className='border-t border-border px-6 py-8 text-center flex flex-col items-center justify-center text-base gap-2.5 text-neutral-10'>
        <Image
          src='/Santibet Logo.svg'
          alt='SantiBet'
          width={100}
          height={38}
          className='h-11 shrink-0 dark:invert'
          priority
        />
        <div>
          © {year} Awa Lawa Limited · SantiBet is not yet live · No deposit or
          payment is required to take part
        </div>
      </footer>
    </>
  )
}
