import Link from "next/link";

type SiteFooterProps = {
  showCategoryDiscovery?: boolean;
};

export function SiteFooter({ showCategoryDiscovery = false }: SiteFooterProps) {
  return (
    <footer>
      {showCategoryDiscovery ? (
        <div className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8" style={{ background: "#fdf2f5" }}>
          <div className="mx-auto max-w-[1200px]">
            <p className="mb-2 text-[10px] uppercase tracking-[0.38em] text-[#af7795]">
              Fedezd fel
            </p>
            <h3
              className="mb-10 font-[family:var(--font-display)] tracking-[-0.03em] text-[#4d2741]"
              style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)" }}
            >
              Vásároljon karkötőket Féldrágakő, Kristály, Ásványok szerint!
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Link href="/bracelets" className="group block overflow-hidden rounded-md">
                <div
                  className="flex aspect-[3/4] w-full items-end transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ background: "linear-gradient(145deg, #fff0f7 0%, #f5c9e2 50%, #e8a8cc 100%)" }}
                >
                  <div
                    className="w-full p-4"
                    style={{ background: "linear-gradient(to top, rgba(77,39,65,0.55), transparent)" }}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-[0.3em] text-white/70">Karkötő</p>
                    <p className="text-sm font-medium text-white">Rózsakvarc</p>
                  </div>
                </div>
              </Link>

              <Link href="/bracelets" className="group block overflow-hidden rounded-md">
                <div
                  className="flex aspect-[3/4] w-full items-end transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ background: "linear-gradient(145deg, #f4f0ff 0%, #ddd4f5 50%, #c4aee8 100%)" }}
                >
                  <div
                    className="w-full p-4"
                    style={{ background: "linear-gradient(to top, rgba(77,39,65,0.55), transparent)" }}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-[0.3em] text-white/70">Karkötő</p>
                    <p className="text-sm font-medium text-white">Ametiszt</p>
                  </div>
                </div>
              </Link>

              <Link href="/necklaces" className="group block overflow-hidden rounded-md">
                <div
                  className="flex aspect-[3/4] w-full items-end transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ background: "linear-gradient(145deg, #f8f4ff 0%, #e8dff5 50%, #d4c4e8 100%)" }}
                >
                  <div
                    className="w-full p-4"
                    style={{ background: "linear-gradient(to top, rgba(77,39,65,0.55), transparent)" }}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-[0.3em] text-white/70">Nyaklánc</p>
                    <p className="text-sm font-medium text-white">Holdkő</p>
                  </div>
                </div>
              </Link>

              <Link href="/necklaces" className="group block overflow-hidden rounded-md">
                <div
                  className="flex aspect-[3/4] w-full items-end transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ background: "linear-gradient(145deg, #fffbf0 0%, #fdefd4 50%, #f5d8a8 100%)" }}
                >
                  <div
                    className="w-full p-4"
                    style={{ background: "linear-gradient(to top, rgba(77,39,65,0.55), transparent)" }}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-[0.3em] text-white/70">Nyaklánc</p>
                    <p className="text-sm font-medium text-white">Citrin</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main footer */}
      <div style={{ background: "#1f1e1c" }} className="px-4 py-7 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-[1200px]">

          {/* 4-column grid */}
          <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:mb-10 sm:gap-8 lg:grid-cols-4">

            {/* Customer service */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#888] mb-4">
                Ügyfélszolgálat
              </p>
              <ul className="space-y-1 sm:space-y-2.5">
                {[
                  { label: "Rendelési állapot", href: "/order-status" },
                  { label: "Kapcsolat", href: "/contact" },
                  { label: "Szállítás", href: "/terms#szallitas" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-7 items-center text-sm text-[#aaa] transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Membership */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#888] mb-4">
                Tagság
              </p>
              <ul className="space-y-1 sm:space-y-2.5">
                {[
                  { label: "Instagram", href: "https://instagram.com/chicksjewelry", external: true },
                  { label: "Regisztráció", href: "/sign-up", external: false },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex min-h-7 items-center text-sm text-[#aaa] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#888] mb-4">
                Rólunk
              </p>
              <ul className="space-y-1 sm:space-y-2.5">
                {[
                  { label: "Kövek", href: "/stones", external: false },
                  { label: "GYIK", href: "/faq", external: false },
                  { label: "Kövess Instagramon", href: "https://instagram.com/chicksjewelry", external: true },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex min-h-7 items-center text-sm text-[#aaa] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#888] mb-4">
                Jogi nyilatkozat
              </p>
              <ul className="space-y-1 sm:space-y-2.5">
                {[
                  { label: "Általános feltételek", href: "/terms" },
                  { label: "Adatvédelmi szabályzat", href: "/privacy" },
                  { label: "Süti beállítások", href: "/cookies" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-7 items-center text-sm text-[#aaa] transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col items-start justify-between gap-3 border-t border-[#2a2a28] pt-6 text-left sm:flex-row sm:items-center">
            <span className="font-[family:var(--font-display)] text-sm text-[#555]">Chicks Jewelry</span>
            <p className="text-[11px] text-[#555]">
              © {new Date().getFullYear()} Chicks Jewelry. Minden jog fenntartva.
            </p>
            <p className="text-[11px] text-[#555]">
              Kézzel alkotva · Féldrágakövekből
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
