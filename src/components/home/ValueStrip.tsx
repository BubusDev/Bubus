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
    <div className="w-full border-y border-[#ece9e2] bg-[#fbfaf7] px-6 py-5">
      <div className="mx-auto flex max-w-[1320px] items-center overflow-x-auto lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VALUES.map(({ label, href }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className="flex-shrink-0 whitespace-nowrap px-5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#686d5b] transition hover:text-[#1f231d] lg:px-8"
            >
              {label}
            </Link>
          ) : (
            <span
              key={label}
              className="flex-shrink-0 whitespace-nowrap px-5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#686d5b] lg:px-8"
            >
              {label}
            </span>
          )
        )}
      </div>
    </div>
  );
}
