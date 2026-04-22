import Link from "next/link";

export function CustomNavbar() {
  return (
    <header className="bg-[#f3bdc8] px-4 py-6 text-[#fdfaf7] sm:px-8 lg:px-12">
      <nav className="mx-auto grid max-w-[1520px] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link
          href="/"
          className="text-xs font-light uppercase tracking-[0.16em] text-[#7a2a3e] transition hover:text-[#fdfaf7] sm:text-sm"
        >
          ← Vissza a webshophoz
        </Link>
        <p className="font-serif text-lg tracking-wide text-[#fdfaf7] sm:text-xl">
          Chicks Jewelry
        </p>
        <div className="justify-self-end font-serif text-2xl italic text-[#7a2a3e]/60">•</div>
      </nav>
    </header>
  );
}
