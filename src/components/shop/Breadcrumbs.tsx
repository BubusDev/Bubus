import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({
  items,
  className = "",
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-[11px] tracking-[0.08em] text-[#9a8591] ${className}`.trim()}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition hover:text-[#5e0034]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-[#6f5967]" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
