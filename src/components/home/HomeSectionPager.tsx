import Link from "next/link";

type HomeSectionPagerProps = {
  page: number;
  totalPages: number;
  pageParam: string;
  searchParams?: Record<string, string | undefined>;
};

export function HomeSectionPager({
  page,
  totalPages,
  pageParam,
  searchParams,
}: HomeSectionPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const getHref = (targetPage: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (!value || key === pageParam) {
        continue;
      }

      params.set(key, value);
    }

    if (targetPage > 1) {
      params.set(pageParam, String(targetPage));
    }

    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-[#ecd3e3] bg-white/80 px-4 py-3 text-sm text-[#6b425a]">
      <span>
        Page {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={getHref(prevPage)}
          aria-disabled={page <= 1}
          className={`inline-flex h-10 items-center justify-center rounded-full px-4 transition ${
            page <= 1
              ? "pointer-events-none border border-[#f0dbe6] bg-[#fff7fb] text-[#c4a8b7]"
              : "border border-[#ecd3e3] bg-white text-[#6b425a] hover:border-[#e9b6d0]"
          }`}
        >
          Previous
        </Link>
        <Link
          href={getHref(nextPage)}
          aria-disabled={page >= totalPages}
          className={`inline-flex h-10 items-center justify-center rounded-full px-4 transition ${
            page >= totalPages
              ? "pointer-events-none border border-[#f0dbe6] bg-[#fff7fb] text-[#c4a8b7]"
              : "border border-[#ecd3e3] bg-white text-[#6b425a] hover:border-[#e9b6d0]"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
