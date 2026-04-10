import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto max-w-[960px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <section className="rounded-[2rem] border border-[#efe7eb] bg-[#fcfafb] px-6 py-10 text-center sm:px-10 sm:py-14">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#b06b8e]">
          Termék nem érhető el
        </p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-[2.3rem] leading-none text-[#4d2741] sm:text-[2.8rem]">
          Ez a termékoldal már nem tölthető be
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-sm leading-7 text-[#7a6070]">
          A keresett termék hiányzik, már nem elérhető, vagy az adatai jelenleg nem
          teljesek. Nézz vissza a kollekciókhoz, és válassz egy másik darabot.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f2230] px-6 text-sm font-medium text-white transition hover:opacity-90"
          >
            Vissza a főoldalra
          </Link>
          <Link
            href="/new-in"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#e7dde3] bg-white px-6 text-sm font-medium text-[#4d2741] transition hover:border-[#dcb8cc]"
          >
            Újdonságok megnyitása
          </Link>
        </div>
      </section>
    </main>
  );
}
