import type { ReactNode } from "react";

import { AccountNavigation } from "@/components/account/AccountNavigation";

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
    <main className="w-full border-t border-[#efe8e3] bg-[#faf8f7]/88">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:py-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <h1 className="sr-only">{title}</h1>
        {description ? <p className="sr-only">{description}</p> : null}
        <AccountNavigation />
        <section className="min-w-0 space-y-5">{children}</section>
      </div>
    </main>
  );
}
