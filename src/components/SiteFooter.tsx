import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      {/* Newsletter strip */}
      <div
        className="px-8 py-10 text-center"
        style={{ background: "#c45a85" }}
      >
        <h3 className="font-[family:var(--font-display)] text-xl text-white mb-2">
          Iratkozzon fel, és 10% kedvezményt kap
        </h3>
        <p className="text-sm text-white/75 mb-5 max-w-[44ch] mx-auto">
          Értesüljön elsőként az új kollekciókról, stílusinspirációkról
          és exkluzív ajánlatokról.
        </p>
        <form className="flex gap-0 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="E-mail-cím"
            className="flex-1 px-4 py-3 text-sm text-[#1a1a1a] outline-none border-0"
          />
          <button
            type="submit"
            className="bg-[#1a1a1a] text-white px-5 py-3 text-sm font-medium hover:bg-[#333] transition whitespace-nowrap"
          >
            Feliratkozás
          </button>
        </form>
      </div>

      {/* Main footer */}
      <div style={{ background: "#1f1e1c" }} className="px-8 py-12">
        <div className="mx-auto max-w-[1200px]">

          {/* 4-column grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">

            {/* Customer service */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#888] mb-4">
                Ügyfélszolgálat
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Rendelési állapot", href: "/account/orders" },
                  { label: "Kapcsolat", href: "/contact" },
                  { label: "Szállítás", href: "/terms#szallitas" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[#aaa] hover:text-white transition">
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
              <ul className="space-y-2.5">
                {[
                  { label: "Instagram", href: "https://instagram.com/chicksjewelry", external: true },
                  { label: "Regisztráció", href: "/sign-up", external: false },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-[#aaa] hover:text-white transition"
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
              <ul className="space-y-2.5">
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
                      className="text-sm text-[#aaa] hover:text-white transition"
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
              <ul className="space-y-2.5">
                {[
                  { label: "Általános feltételek", href: "/terms" },
                  { label: "Adatvédelmi szabályzat", href: "/privacy" },
                  { label: "Süti beállítások", href: "/cookies" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[#aaa] hover:text-white transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="border-t border-[#2a2a28] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
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
