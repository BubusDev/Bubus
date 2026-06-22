import Link from "next/link";

const VALUES: { label: string; body: string; href?: string }[] = [
  { label: "Kis széria", body: "Új darabok korlátozott mennyiségben, átgondolt ritmusban." },
  { label: "Válogatott anyagok", body: "Kövek és tónusok, amelyek közelről is szépek.", href: "/stones" },
  { label: "Finom részletek", body: "Nem harsány kiegészítők, mégis emlékezetes karakterrel." },
];

export function ValueStrip() {
  return (
    <section className="w-full bg-[#fbfaf7] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-6 border-b border-[#e7e1d7] border-t border-[#e7e1d7] py-7 sm:grid-cols-3 sm:gap-8 sm:py-8">
        {VALUES.map(({ label, body, href }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className="group block text-left transition"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#6f775d]">
                {label}
              </p>
              <p className="mt-2 max-w-[30ch] text-sm leading-6 text-[#69645b] transition group-hover:text-[#2b2d27]">
                {body}
              </p>
            </Link>
          ) : (
            <div
              key={label}
              className="block text-left"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#6f775d]">
                {label}
              </p>
              <p className="mt-2 max-w-[30ch] text-sm leading-6 text-[#69645b]">
                {body}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
