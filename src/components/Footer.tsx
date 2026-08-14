import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <section className='pt-18 pb-14 text-center'>
        <div className='mx-auto max-w-270 px-6'>
          <div className='mb-3  text-xs tracking-[2px] font-extrabold text-success uppercase'>
            Don&apos;t just wait
          </div>
          <h2 className='mx-auto max-w-160 font-display text-[clamp(28px,4.5vw,44px)] font-extrabold tracking-[-0.01em] text-black'>
            Be part of the journey
          </h2>
          <p className='mx-auto mt-4 max-w-125 text-[16.5px] text-placeholder'>
            Every prediction before launch brings you closer to Founder rewards,
            bigger launch bonuses, and a shot at the Grand Prize.
          </p>
          <div className='mt-8 flex flex-wrap justify-center gap-2.5'>
            <a
              href='#market'
              className='inline-block rounded-lg bg-brand-green px-6 py-3.25 font-bold text-black no-underline'
            >
              Make today&apos;s call
            </a>
          </div>
          <div className='mt-3.5  text-[12px] tracking-[0.3px] text-neutral-10'>
            NO REGISTRATION &nbsp;·&nbsp; NO DEPOSIT &nbsp;·&nbsp; NO PAYMENT
            REQUIRED
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-140 border-t border-dashed border-border' />

      <footer className='px-6 py-8 text-center  text-[11.5px] text-neutral-10'>
        <Image
          src='/Santibet Logo (white).svg'
          alt='SantiBet'
          width={169}
          height={38}
          className='h-12 mx-auto w-auto'
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
