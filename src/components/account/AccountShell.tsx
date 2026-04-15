import type { ReactNode } from "react";

import { AccountNavigation } from "@/components/account/AccountNavigation";

type AccountShellProps = {
  title: string;
  description?: string;
  banner?: ReactNode;
  children: ReactNode;
};

export function AccountShell({
  title,
  description,
  banner,
  children,
}: AccountShellProps) {
  return (
    <main className="w-full border-t border-[#ede8e3] bg-[#f8f6f4]">
      {banner}
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8 lg:py-7 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <h1 className="sr-only">{title}</h1>
        {description ? <p className="sr-only">{description}</p> : null}
        <AccountNavigation />
        <section className="min-w-0 space-y-4">{children}</section>
      </div>
    </main>
  );
}
