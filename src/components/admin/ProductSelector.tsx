"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type ProductOption = {
  id: string;
  name: string;
};

type ProductSelectorProps = {
  products: ProductOption[];
  initialSelectedIds?: string[];
  name?: string;
};

export function ProductSelector({
  products,
  initialSelectedIds = [],
  name = "productIds",
}: ProductSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSet = new Set(selectedIds);
  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductOption => p !== undefined);

  const filteredProducts = products.filter(
    (p) =>
      !selectedSet.has(p.id) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function add(product: ProductOption) {
    setSelectedIds((prev) => [...prev, product.id]);
    setSearch("");
    setOpen(false);
  }

  function remove(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="grid gap-2">
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-ink-500)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Termék keresése..."
          className="admin-input h-10 pl-9 pr-3 text-sm"
          autoComplete="off"
        />
        {open && search && filteredProducts.length === 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-[var(--admin-line-200)] bg-white px-3 py-2.5 text-xs text-[var(--admin-ink-500)] shadow-md">
            Nincs találat.
          </div>
        )}
        {open && filteredProducts.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--admin-line-200)] bg-white shadow-md">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(product);
                }}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-[var(--admin-ink-900)] hover:bg-[var(--admin-blue-050)]"
              >
                <span className="truncate">{product.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProducts.map((product) => (
            <span
              key={product.id}
              className="inline-flex max-w-xs items-center gap-1.5 rounded-md border border-[rgba(42,99,181,0.2)] bg-[#eef3fb] px-2.5 py-1 text-xs font-medium text-[var(--admin-blue-700)]"
            >
              <span className="truncate">{product.name}</span>
              <button
                type="button"
                onClick={() => remove(product.id)}
                aria-label={`Termék eltávolítása: ${product.name}`}
                className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded hover:bg-[rgba(42,99,181,0.15)]"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selectedProducts.length === 0 && (
        <p className="text-[11px] text-[var(--admin-ink-500)]">
          Még nincs kiválasztott termék. Keress fent és kattints a hozzáadáshoz.
        </p>
      )}
    </div>
  );
}
