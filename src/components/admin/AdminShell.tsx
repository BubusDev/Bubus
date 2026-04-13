import type { ReactNode } from "react";

type AdminShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AdminShell({ title, description, children, actions }: AdminShellProps) {
  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family:var(--font-display)] text-[1.55rem] leading-tight tracking-[-0.03em] text-[var(--admin-ink-900)] sm:text-[1.8rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-[var(--admin-ink-600)]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="min-w-0 flex-shrink-0 lg:max-w-[62%]">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
