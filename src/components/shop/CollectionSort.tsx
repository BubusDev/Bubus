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
    <label className="inline-flex items-center gap-3 border-b border-[#eadce4] pb-2 text-sm text-[#6d5260]">
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
        className="bg-transparent text-sm font-medium text-[#4d2741] outline-none"
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