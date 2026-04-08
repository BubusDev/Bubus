import type { ReactNode } from "react";

type AdminShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AdminShell({ title, description, children, actions }: AdminShellProps) {
  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family:var(--font-display)] text-[1.8rem] leading-tight tracking-[-0.03em] text-[#1a1a1a]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-[#888]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
