import Link from "next/link";

const NAV_LINKS = [
  { label: "Főoldal", href: "/" },
  { label: "Rólunk", href: "/about" },
  { label: "Kapcsolat", href: "/contact" },
  { label: "GYIK", href: "/faq" },
];

export function EditorialBrandBlock() {
  return (
    <div className="flex flex-col">
      {/* Logo */}
      <span
        className="font-[family:var(--font-display)] text-[2rem] font-semibold leading-none"
        style={{
          background: "linear-gradient(135deg, #c45a85, #e07a70)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Bubus
      </span>

      {/* Eyebrow */}
      <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#b06b8e]">
        ✦ Kézzel alkotva · Féldrágakövekből
      </p>

      {/* Brand statement */}
      <p className="mt-5 text-sm leading-[1.85] text-[#7d5b75]">
        Minden ékszerünk egyedi kézimunka — válogatott féldrágakövekből, szeretettel alkotva.
      </p>

      {/* Decorative divider */}
      <div className="mt-6 h-px w-12 bg-gradient-to-r from-[#e3ccd8] to-transparent" />

      {/* Navigation */}
      <nav className="mt-10 flex flex-col gap-1.5">
        {/* Elválasztó vonal a tartalom és a nav között */}
        <div className="mb-4 h-px w-12 bg-gradient-to-r from-[#f77ff0] to-transparent" />

        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-3 py-1 text-[13px] text-[#7d5b75] transition-all hover:text-[#4f2348]"
          >
            <span className="h-px w-3 bg-[#dfc8d8] transition-all duration-300 group-hover:w-5 group-hover:bg-[#c45a85]" />
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
