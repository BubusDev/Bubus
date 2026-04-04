import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const navItems = [
  { href: "/admin", label: "Áttekintés" },
  { href: "/admin/products", label: "Termékek" },
  { href: "/admin/products/new", label: "Új termék" },
  { href: "/admin/announcement", label: "Üzenetsáv" },
  { href: "/admin/special-edition", label: "Special Edition" },
];

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <main className="mx-auto max-w-[1480px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] shadow-[0_20px_50px_rgba(198,129,167,0.12)] backdrop-blur-xl">
        <div className="border-b border-[#f0dbe6] px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#af7795]">
                Admin felület
              </p>

              <h1 className="font-[family:var(--font-display)] text-[2.2rem] leading-[0.95] tracking-[-0.05em] text-[#4d2741] sm:text-[3rem]">
                {title}
              </h1>

              <p className="max-w-[60ch] text-sm leading-7 text-[#765f6d] sm:text-base">
                {description}
              </p>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center rounded-full border border-[#ecd3e3] bg-white/90 px-4 py-2.5 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0] hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
