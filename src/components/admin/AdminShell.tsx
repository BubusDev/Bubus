import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <main className="mx-auto max-w-[1480px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] shadow-[0_20px_50px_rgba(198,129,167,0.12)] backdrop-blur-xl">
        <div className="border-b border-[#f0dbe6] px-5 py-5 sm:px-8 sm:py-6">
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
        </div>

        <AdminNav />

        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
