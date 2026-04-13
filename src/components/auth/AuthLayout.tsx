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
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <section className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_24rem] lg:items-start lg:gap-16">
        <div className="max-w-[38rem]">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#9b8978]">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-[2.6rem] leading-[0.98] tracking-[-0.04em] text-[#201a17] sm:mt-6 sm:text-[3.6rem] lg:text-[4.3rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-[34rem] text-[15px] leading-8 text-[#655b54] sm:mt-6">
            {description}
          </p>
          {aside ? <div className="mt-8 sm:mt-12">{aside}</div> : null}
        </div>

        <div className="border border-[#e7dfd7] bg-[#fffdf9] p-5 sm:p-8 lg:p-10">
          {children}
        </div>
      </section>
    </main>
  );
}
