import Link from "next/link";

export function HomeNewsletterBlock() {
  return (
    <section className="bg-[#fbfaf7] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px] border-y border-[#dedbd2] py-12 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#747a64]">
          Hírlevél
        </p>
        <h2 className="mt-4 font-[family:var(--font-display)] text-[2.2rem] leading-tight tracking-[-0.03em] text-[#22231f] sm:text-[3rem]">
          Iratkozz fel hírlevelünkre
        </h2>
        <p className="mx-auto mt-5 max-w-[68ch] text-sm leading-8 text-[#615f58]">
          Nem tipikus spam, ígérgetés, elsőként fogsz értesülni új ajánlatainkról,
          időszakos kiadásainkról és exkluzív akciókról csak feliratkozóknak.
        </p>
        <Link
          href="/sign-up"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-[#22231f] px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#22231f] transition hover:bg-[#22231f] hover:text-white"
        >
          Feliratkozom
        </Link>
      </div>
    </section>
  );
}
