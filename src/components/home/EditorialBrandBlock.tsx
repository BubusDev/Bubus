import Link from "next/link";

export function EditorialBrandBlock() {
  return (
    <aside className="px-2 py-2 lg:sticky lg:top-28">
      <div className="max-w-[420px] space-y-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
            Butik ékszer webáruház
          </p>
          <div className="space-y-2">
            <h1 className="max-w-[10ch] font-sans text-[2.9rem] font-semibold leading-[0.9] tracking-[-0.06em] text-[#4f2348] sm:text-[3.5rem]">
              Ékszerek,
              <br />
              amik a te
              <br />
              történetedhez
              <br />
              készülnek.
            </h1>
            <p className="max-w-[14ch] font-serif text-[2rem] leading-[0.95] tracking-[-0.03em] text-[#4f2348] sm:text-[2.4rem]">
              <span className="relative inline-block text-[#f77ff0]">
                egyedi design
                <span className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.28em] rounded-full bg-[#f7ff7a]/70 blur-[1px]" />
              </span>
              <span className="text-[#4f2348]"> minden személyiséghez.</span>
            </p>
          </div>
        </div>

        <div className="h-px w-16 bg-gradient-to-r from-[#f77ff0] to-transparent" />

        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#b760aa]">
            From the heart by Borbolya
          </p>
          <p className="max-w-[24ch] text-sm leading-7 text-[#7d5b75] sm:text-[15px]">
            Megbízható, eredeti féldrágakövekből készített kollekciók,
            finoman nőies, modern megjelenéssel.
          </p>
        </div>

        {/* Navigációs linkek */}
        <div className="space-y-1 pt-2">
          <div className="mb-4 h-px w-12 bg-gradient-to-r from-[#f77ff0] to-transparent" />
          {[
            { label: "Főoldal", href: "/" },
            { label: "Rólunk", href: "/about" },
            { label: "Kapcsolat", href: "/contact" },
            { label: "GYIK", href: "/faq" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 py-1.5 text-sm text-[#7d5b75] transition-all hover:text-[#4f2348]"
            >
              <span className="h-px w-4 bg-[#e3ccd8] transition-all duration-300 group-hover:w-6 group-hover:bg-[#c45a85]" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
