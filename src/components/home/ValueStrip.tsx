import Link from "next/link";

const VALUES: { label: string; href?: string }[] = [
  { label: "KÉZZEL ALKOTVA" },
  { label: "FÉLDRÁGAKÖVEK", href: "/stones" },
  { label: "ETIKUS BESZERZÉS" },
  { label: "LIMITÁLT DARABOK" },
  { label: "MINŐSÉG GARANTÁLT" },
];

export function ValueStrip() {
  return (
    <div className="w-full border-y border-[#ece9e2] bg-[#fbfaf7] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-1 gap-y-2 overflow-hidden">
        {VALUES.map(({ label, href }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className="flex-shrink-0 whitespace-nowrap px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#686d5b] transition hover:text-[#1f231d] sm:tracking-[0.24em] lg:px-8"
            >
              {label}
            </Link>
          ) : (
            <span
              key={label}
              className="flex-shrink-0 whitespace-nowrap px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#686d5b] sm:tracking-[0.24em] lg:px-8"
            >
              {label}
            </span>
          )
        )}
      </div>
    </div>
  );
}
