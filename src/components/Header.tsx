import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-navy-0/86 backdrop-blur-md">
      <div className="mx-auto flex max-w-270 items-center justify-between px-6 py-2.5">
        <Image
          src="/Santibet Logo.svg"
          alt="SantiBet"
          width={169}
          height={38}
          className="h-12 w-auto"
          priority
        />
        <div className="hidden font-mono text-[11px] tracking-[1.5px] text-slate uppercase sm:block">
          Prediction Market
        </div>
      </div>
    </header>
  );
}
