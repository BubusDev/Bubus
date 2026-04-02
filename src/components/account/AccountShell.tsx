// AccountShell.tsx
import type { ReactNode } from "react";

type AccountShellProps = {
  title: string;
  description: string;
  currentPath: string;
  children: ReactNode;
};

export function AccountShell({
  children,
}: AccountShellProps) {
  return (
    <main className="w-full px-0 pb-20 pt-0">
      <section>{children}</section>
    </main>
  );
}