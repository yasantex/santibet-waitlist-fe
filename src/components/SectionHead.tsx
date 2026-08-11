export default function SectionHead({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-150 text-center">
      <div className="mb-3 font-mono text-xs tracking-[2px] text-gold uppercase">{kicker}</div>
      <h2 className="font-display text-[clamp(26px,4.2vw,40px)] font-extrabold tracking-[0.3px] uppercase">
        {title}
      </h2>
      {subtitle && <p className="mt-2.5 text-[15px] text-paper-dim">{subtitle}</p>}
    </div>
  );
}
