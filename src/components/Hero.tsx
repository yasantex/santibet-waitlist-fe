import CountdownTimer from "./CountdownTimer";

export default function Hero() {
  return (
    <section className="border-b border-line py-16 pb-12 text-center">
      <div className="mx-auto max-w-270 px-6">
        <div className="mb-6.5 inline-flex items-center gap-2 rounded-full border border-line bg-navy-1 px-3.5 py-1.75 font-mono text-xs tracking-[2px] text-gold-bright uppercase">
          <span className="animate-pulse-dot h-1.75 w-1.75 rounded-full bg-win shadow-[0_0_0_3px_rgba(63,166,114,0.2)]" />
          Pre-launch · Predictions live daily
        </div>

        <h1 className="mx-auto max-w-225 font-display text-[clamp(38px,7vw,72px)] leading-[0.98] font-extrabold tracking-[0.5px] uppercase">
          Predict. <span className="text-gold-bright">Win.</span> Repeat.
        </h1>

        <p className="mx-auto mt-5 max-w-140 text-[16.5px] text-paper-dim">
          Every day until launch, one YES or NO bet decides your rank, your rewards, and your
          shot at ₦1,000,000.
        </p>

        <CountdownTimer />

        <a
          href="#market"
          className="mt-8.5 inline-flex items-center gap-1.5 border-b border-dashed border-line pb-0.75 font-mono text-xs tracking-wide text-slate uppercase no-underline transition-colors hover:text-gold-bright"
        >
          ↓ Make today&apos;s call
        </a>
      </div>
    </section>
  );
}
