"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductGridClient } from "@/components/shop/ProductGridClient";
import type { Product } from "@/lib/catalog";

type HomeProductCarouselProps = {
  products: Product[];
  redirectTo?: string;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function HomeProductCarousel({
  products,
  redirectTo = "/",
}: HomeProductCarouselProps) {
  const pages = chunk(products, 4);
  const [page, setPage] = useState(0);

  if (pages.length === 0) return null;

  const canPrev = page > 0;
  const canNext = page < pages.length - 1;

  return (
    <div className="relative rounded-[2rem] border border-[#e8e4d9] bg-white/60 p-6 sm:p-8">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((pageProducts, i) => (
            <div key={i} className="w-full shrink-0">
              <ProductGridClient
                products={pageProducts}
                redirectTo={redirectTo}
                showAddToCart={false}
                wishlistPlacement="image"
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5"
              />
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Előző oldal"
            className={`absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border transition sm:left-4 ${
              canPrev
                ? "border-[#d8d5cc] bg-white text-[#383a32] shadow-sm hover:border-[#9aa083]"
                : "border-[#ece9e2] bg-[#fafaf7] text-[#c5c2bb] cursor-default"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={!canNext}
            aria-label="Következő oldal"
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border transition sm:right-4 ${
              canNext
                ? "border-[#d8d5cc] bg-white text-[#383a32] shadow-sm hover:border-[#9aa083]"
                : "border-[#ece9e2] bg-[#fafaf7] text-[#c5c2bb] cursor-default"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-5 flex justify-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`${i + 1}. oldal`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? "w-6 bg-[#9aa083]" : "w-1.5 bg-[#d8d5cc]"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
