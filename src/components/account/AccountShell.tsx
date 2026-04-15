import type { ReactNode } from "react";

type AccountShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AccountShell({
  title,
  description,
  children,
}: AccountShellProps) {
  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8">
      <header className="pb-7">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#8c7f86]">
          Fiókom
        </p>
        <h1 className="mt-3 font-[family:var(--font-display)] text-[2.25rem] leading-none tracking-[-0.02em] text-[#1a1a1a] sm:text-[2.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[#655b54]">
            {description}
          </p>
        ) : null}
      </header>

      <section className="space-y-7">{children}</section>
    </main>
  );
}
