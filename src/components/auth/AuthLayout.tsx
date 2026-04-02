import type { ReactNode } from "react";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  aside,
}: AuthLayoutProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-[1180px] px-6 py-16 sm:px-8 lg:px-10">
      <section className="grid w-full gap-16 lg:grid-cols-[minmax(0,1.05fr)_24rem] lg:items-start">
        <div className="max-w-[38rem]">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#9b8978]">
            {eyebrow}
          </p>
          <h1 className="mt-6 font-[family:var(--font-display)] text-[3.4rem] leading-[0.94] tracking-[-0.05em] text-[#201a17] sm:text-[4.5rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-[34rem] text-[15px] leading-8 text-[#655b54]">
            {description}
          </p>
          {aside ? <div className="mt-12">{aside}</div> : null}
        </div>

        <div className="border border-[#e7dfd7] bg-[#fffdf9] p-8 sm:p-10">
          {children}
        </div>
      </section>
    </main>
  );
}
