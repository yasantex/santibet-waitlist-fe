import Image from "next/image";

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#grand", label: "Prizes" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#refer", label: "Refer" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-dashed border-border bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-270 items-center justify-between gap-4 px-6 py-2.5">
        <Image
          src="/Santibet Logo (white).svg"
          alt="SantiBet"
          width={169}
          height={38}
          className="h-11 w-auto shrink-0"
          priority
        />

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium  text-neutral-10 transition-colors hover:text-black"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#market"
        className='shrink-0 font-outfit! rounded-full w-fit bg-brand-green px-4 py-2.5 text-xs font-semibold text-black '
        >
          Predict now
        </a>
      </div>
    </header>
  );
}
