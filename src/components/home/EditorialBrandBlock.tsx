import Link from "next/link";

const navLinks = [
  { num: "01", label: "Főoldal", href: "/" },
  { num: "02", label: "Kövek", href: "/stones" },
  { num: "03", label: "Kapcsolat", href: "/contact" },
  { num: "04", label: "GYIK", href: "/faq" },
];

export function EditorialBrandBlock() {
  return (
    <aside className="py-1 lg:sticky lg:top-28">
      <div className="space-y-8">
        {/* Brand identity */}
        <div className="space-y-2">
          <p className="text-[9px] uppercase tracking-[0.44em] text-[#c4a0b4]">
            Butik ékszer
          </p>
          <h1 className="text-[1.65rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[#3d1f30]">
            Chicks
            <br />
            Jewelry
          </h1>
        </div>

        <div className="h-px w-6 bg-[#e8c0d4]" />

        {/* Brand description */}
        <p className="text-[13px] leading-[1.85] text-[#8a6272]">
          Féldrágakövekből készített, kézzel alkotott ékszerek —
          modern nőies szemlélettel.
        </p>

        {/* Editorial navigation — numbered, caps, dividers */}
        <nav aria-label="Site navigation" className="pt-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 border-t border-[#f0dde6] py-3.5 transition-colors"
            >
              <span className="font-mono text-[9px] tabular-nums tracking-[0.15em] text-[#d4b0c4]">
                {link.num}
              </span>
              <span className="text-[11px] uppercase tracking-[0.24em] text-[#9a7080] transition-colors group-hover:text-[#3d1f30]">
                {link.label}
              </span>
            </Link>
          ))}
          <div className="border-t border-[#f0dde6]" />
        </nav>
      </div>
    </aside>
  );
}
