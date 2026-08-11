import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <section className='py-18 pb-14 text-center'>
        <div className='mx-auto max-w-270 px-6'>
          <div className='mb-3 font-mono text-xs tracking-[2px] text-gold uppercase'>
            Don&apos;t just wait
          </div>
          <h2 className='mx-auto max-w-160 font-display text-[clamp(26px,4.2vw,40px)] font-extrabold tracking-[0.3px] uppercase'>
            Be part of the journey
          </h2>
          <p className='mx-auto mt-5 max-w-140 text-[16.5px] text-paper-dim'>
            Every prediction before launch brings you closer to Founder rewards,
            bigger launch bonuses, and a shot at the Grand Prize.
          </p>
          <div className='mt-8.5 flex flex-wrap justify-center gap-2.5'>
            <a
              href='#market'
              className='inline-block rounded-lg bg-gold px-6 py-3.25 font-bold text-navy-0 no-underline transition-[transform,box-shadow] hover:-translate-y-px hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(168,216,10,0.55)]'
            >
              Make today&apos;s call
            </a>
          </div>
          <div className='mt-3.5 font-mono text-[12.5px] tracking-[0.3px] text-slate'>
            NO REGISTRATION &nbsp;·&nbsp; NO DEPOSIT &nbsp;·&nbsp; NO PAYMENT
            REQUIRED
          </div>
        </div>
      </section>
      <footer className='px-6 py-7 pb-10 text-center font-mono text-[11.5px] text-slate'>
        <Image
          src='/Santibet Logo.svg'
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
