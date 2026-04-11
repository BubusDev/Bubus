function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InstagramBanner() {
  return (
    <section className="mx-auto my-8 max-w-[1450px] px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-y border-[#eadce4] py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <InstagramIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#c45a85]" />
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.3em] text-[#a97b94]">
              Kövess minket
            </p>
            <h3 className="mb-1 font-[family:var(--font-display)] text-xl leading-tight text-[#2f2230]">
              @chicksjewelry az Instagramon
            </h3>
            <p className="max-w-[48ch] text-sm leading-6 text-[#6d5260]">
              Párosítási ötletek karkötőkhöz és előzetes betekintés az új darabokba.
            </p>
          </div>
        </div>

        <a
          href="https://instagram.com/chicksjewelry"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#c45a85] transition hover:text-[#8f3c62]"
        >
          Követés Instagramon
        </a>
      </div>
    </section>
  );
}
