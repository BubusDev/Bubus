"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "featured", label: "Kiemelt" },
  { value: "newest", label: "Újdonságok" },
  { value: "price-asc", label: "Ár szerint növekvő" },
  { value: "price-desc", label: "Ár szerint csökkenő" },
  { value: "name", label: "Név szerint" },
];

type CollectionSortProps = {
  currentSort: string;
};

export function CollectionSort({ currentSort }: CollectionSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="inline-flex min-h-11 items-center gap-3 border-b border-[#eadce4] pb-2 text-sm text-[#6d5260]">
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#a97b94]">
        Rendezés
      </span>

      <select
        value={currentSort}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", event.target.value);
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="min-h-10 rounded-full border border-[#ead6e1] bg-[#fffafc] px-3 py-2 text-sm font-medium text-[#4d2741] shadow-[0_10px_24px_rgba(176,113,145,0.08)] outline-none transition focus:border-[#dca9c3]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
