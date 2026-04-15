import type { ReactNode } from "react";
import Link from "next/link";
import { Heart, LogOut, Settings, ShoppingBag, TicketPercent, User } from "lucide-react";

type AccountShellProps = {
  title: string;
  description?: string;
  currentPath: string;
  children: ReactNode;
};

const accountNavItems = [
  { label: "Profil", href: "/profile", icon: User },
  { label: "Rendeléseim", href: "/orders", icon: ShoppingBag },
  { label: "Kedvencek", href: "/favourites", icon: Heart },
  { label: "Kuponjaim", href: "/profile#kuponjaim", icon: TicketPercent },
  { label: "Beállítások", href: "/settings", icon: Settings },
];

function isActiveNavItem(currentPath: string, href: string) {
  if (href.includes("#")) {
    return currentPath === href;
  }

  if (href === "/orders") {
    return currentPath === "/orders" || currentPath.startsWith("/orders/");
  }

  return currentPath === href;
}

export function AccountShell({
  title,
  description,
  currentPath,
  children,
}: AccountShellProps) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <header className="border-b border-[#e8e5e0] pb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7f86]">
          Fiókom
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[680px]">
            <h1 className="font-[family:var(--font-display)] text-[2.25rem] leading-none tracking-[-0.03em] text-[#1a1a1a] sm:text-[2.8rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[#655b54]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <nav
        aria-label="Fiók navigáció"
        className="mt-5 flex gap-2 overflow-x-auto border-b border-[#e8e5e0] pb-4"
      >
        {accountNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = isActiveNavItem(currentPath, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-3.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d2741]/20 ${
                isActive
                  ? "border-[#4d2741] bg-[#4d2741] text-white"
                  : "border-[#e8e5e0] bg-white/76 text-[#5f5059] hover:border-[#d8c7cf] hover:bg-white hover:text-[#2d1f28]"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
        <form action="/auth/logout" method="post" className="ml-auto">
          <button
            type="submit"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#e8e5e0] bg-white/76 px-3.5 text-sm text-[#5f5059] transition hover:border-[#d8c7cf] hover:bg-white hover:text-[#2d1f28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d2741]/20"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Kijelentkezés</span>
          </button>
        </form>
      </nav>

      <section className="mt-8 space-y-8">{children}</section>
    </main>
  );
}
