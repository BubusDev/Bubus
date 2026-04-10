import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AdminAuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function AdminAuthShell({
  title,
  description,
  children,
  aside,
}: AdminAuthShellProps) {
  return (
    <div className="admin-shell-bg min-h-screen">
      <header className="border-b border-[var(--admin-line-100)] bg-[rgba(255,255,255,0.96)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--admin-ink-500)]">
              Admin
            </p>
            <p className="mt-1 text-sm text-[var(--admin-ink-700)]">
              Hozzáférés az adminisztrációs felülethez.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[var(--admin-line-200)] bg-white px-3 py-2 text-xs font-medium text-[var(--admin-ink-700)] transition hover:bg-[var(--admin-surface-050)] hover:text-[var(--admin-ink-900)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Vissza a webshophoz
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-6xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <section className="max-w-2xl">
          <h1 className="text-[2.25rem] font-semibold tracking-[-0.03em] text-[var(--admin-ink-900)] sm:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--admin-ink-600)]">
            {description}
          </p>
          {aside ? <div className="mt-8">{aside}</div> : null}
        </section>

        <section className="border border-[var(--admin-line-100)] bg-white p-8 shadow-[0_18px_42px_rgba(23,32,51,0.06)] sm:p-10">
          {children}
        </section>
      </main>
    </div>
  );
}
