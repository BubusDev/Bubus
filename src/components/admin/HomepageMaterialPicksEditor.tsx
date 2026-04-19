"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { saveHomepageMaterialPicksAction } from "@/app/(admin)/admin/content/homepage/actions";
import { formatPrice } from "@/lib/catalog";
import type {
  HomepageContentView,
  HomepageMaterialPickOptions,
} from "@/lib/homepage-content";
import { productHasStone } from "@/lib/stone-product";

type PickSlot = {
  stoneId: string;
  productId: string;
  hasUnavailableFeaturedProduct?: boolean;
  unavailableFeaturedProductReason?: string | null;
};

type HomepageMaterialPicksEditorProps = {
  picks: HomepageContentView["materialPicks"];
  options: HomepageMaterialPickOptions;
};

function buildInitialSlots(picks: HomepageContentView["materialPicks"]): PickSlot[] {
  const filledSlots = picks
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4)
    .map((pick) => ({
      stoneId: pick.type === "STONE" ? pick.itemId : "",
      productId: pick.storedFeaturedProductId ?? pick.featuredProductId ?? "",
      hasUnavailableFeaturedProduct: pick.hasUnavailableFeaturedProduct,
      unavailableFeaturedProductReason: pick.unavailableFeaturedProductReason,
    }));

  return Array.from(
    { length: 4 },
    (_, index) => filledSlots[index] ?? { stoneId: "", productId: "" },
  );
}

function ProductSlotPicker({
  disabled,
  productId,
  products,
  stoneName,
  onChange,
}: {
  disabled: boolean;
  productId: string;
  products: HomepageMaterialPickOptions["products"];
  stoneName: string;
  onChange: (productId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedProduct = products.find((product) => product.id === productId);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = products
    .filter((product) => product.id !== productId)
    .filter((product) => {
      if (!normalizedQuery) return true;
      return [product.name, product.slug, product.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, 8);

  if (disabled) {
    return (
      <div className="rounded-md border border-dashed border-[var(--admin-line-100)] bg-white px-4 py-5 text-sm text-[var(--admin-ink-500)]">
        Először válassz Stone-t. Kiemelt termék csak a kiválasztott Stone-hoz adható hozzá.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--admin-line-100)] bg-white px-4 py-5 text-sm text-[var(--admin-ink-500)]">
        <p>Ehhez a kőhöz jelenleg nincs termék.</p>
        <p className="mt-1">
          Új termék létrehozása vagy meglévő termék Stone beállítása szükséges.
          <Link
            href="/admin/products/new"
            className="ml-2 font-medium text-[var(--admin-ink-900)] underline underline-offset-2"
          >
            Új termék
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-ink-500)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${stoneName} termékei között keresés`}
          className="admin-input min-h-10 pl-9 pr-3 text-sm"
          autoComplete="off"
        />
      </div>

      {selectedProduct ? (
        <div className="flex items-center gap-3 rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-3 py-2">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded border border-[var(--admin-line-100)] bg-white">
            {selectedProduct.imageUrl ? (
              <Image
                src={selectedProduct.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
              {selectedProduct.name}
            </span>
            <span className="block truncate text-xs text-[var(--admin-ink-500)]">
              Kiemelt termék · {selectedProduct.categoryName} · {formatPrice(selectedProduct.price)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white text-red-600"
            aria-label={`${selectedProduct.name} eltávolítása`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid max-h-52 gap-1 overflow-auto rounded-md border border-[var(--admin-line-100)] bg-white p-1">
        {matches.length > 0 ? (
          matches.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onChange(product.id);
                setQuery("");
              }}
              className="flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition hover:bg-[var(--admin-blue-050)]"
            >
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                  {product.name}
                </span>
                <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                  {product.categoryName} · {formatPrice(product.price)}
                </span>
              </span>
            </button>
          ))
        ) : (
          <span className="px-3 py-4 text-sm text-[var(--admin-ink-500)]">
            Ehhez a Stone-hoz nincs választható termék.
          </span>
        )}
      </div>
    </div>
  );
}

export function HomepageMaterialPicksEditor({
  picks,
  options,
}: HomepageMaterialPicksEditorProps) {
  const [slots, setSlots] = useState<PickSlot[]>(() => buildInitialSlots(picks));
  const selectedStoneIds = useMemo(() => slots.map((slot) => slot.stoneId), [slots]);
  const duplicateStoneIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const stoneId of selectedStoneIds) {
      if (!stoneId) continue;
      if (seen.has(stoneId)) duplicates.add(stoneId);
      seen.add(stoneId);
    }
    return duplicates;
  }, [selectedStoneIds]);

  function updateSlot(index: number, nextSlot: PickSlot) {
    setSlots((current) => current.map((slot, slotIndex) => (slotIndex === index ? nextSlot : slot)));
  }

  return (
    <form action={saveHomepageMaterialPicksAction} className="admin-panel p-5">
      <div className="mb-5">
        <p className="admin-eyebrow">Kezdőlapi válogatás</p>
        <h2 className="mt-2 text-lg font-semibold text-[var(--admin-ink-900)]">
          Stone alapú kezdőlapi cardok
        </h2>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-[var(--admin-ink-600)]">
          Válassz legfeljebb 4 Stone-t. A Stone adja a card témáját és címét; a kiemelt Product
          opcionális, és csak az adott Stone-hoz tartozó termék lehet.
        </p>
      </div>

      {slots.map((slot, index) => (
        <input
          key={`${index}-${slot.stoneId}-${slot.productId}`}
          type="hidden"
          name="materialPick"
          value={slot.stoneId ? `${slot.stoneId}:${slot.productId}` : ""}
        />
      ))}

      <div className="grid gap-3">
        {slots.map((slot, index) => {
          const selectedStone = options.stones.find((stone) => stone.id === slot.stoneId);
          const compatibleProducts = selectedStone
            ? options.products.filter((product) => productHasStone(product, selectedStone))
            : [];
          const selectedProductIsCompatible = compatibleProducts.some(
            (product) => product.id === slot.productId,
          );
          const productId = selectedProductIsCompatible ? slot.productId : "";
          const previewProduct = compatibleProducts.find((product) => product.id === productId);
          const isInvalidProduct = Boolean(slot.productId && !selectedProductIsCompatible);
          const hasNoAvailableProducts = Boolean(selectedStone && compatibleProducts.length === 0);
          const isDuplicate = Boolean(slot.stoneId && duplicateStoneIds.has(slot.stoneId));
          const productEditHref = slot.productId ? `/admin/products/${slot.productId}/edit` : null;
          const previewHref = previewProduct
            ? `/product/${previewProduct.slug}`
            : selectedStone
              ? `/stones#${selectedStone.slug}`
              : "";

          return (
            <section
              key={index}
              className="rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="admin-eyebrow">{index + 1}. card</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--admin-ink-900)]">
                      {selectedStone ? selectedStone.name : "Nincs Stone kiválasztva"}
                    </h3>
                    {hasNoAvailableProducts ? (
                      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Ehhez a kőhöz nincs elérhető termék
                      </span>
                    ) : null}
                    {slot.hasUnavailableFeaturedProduct ? (
                      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        A kiválasztott termék nem jelenik meg a webshopban
                        {slot.unavailableFeaturedProductReason
                          ? `: ${slot.unavailableFeaturedProductReason}`
                          : ""}
                        {productEditHref ? (
                          <Link
                            href={productEditHref}
                            className="ml-2 font-semibold underline underline-offset-2"
                          >
                            Termék szerkesztése
                          </Link>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--admin-ink-500)]">
                    Card headline: {selectedStone ? selectedStone.name : "Stone választás után jelenik meg"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSlot(index, {
                      stoneId: "",
                      productId: "",
                      hasUnavailableFeaturedProduct: false,
                      unavailableFeaturedProductReason: null,
                    })
                  }
                  className="inline-flex min-h-9 items-center rounded border border-[var(--admin-line-100)] bg-white px-3 text-xs font-medium text-[var(--admin-ink-600)] transition hover:bg-[var(--admin-blue-050)]"
                >
                  Ürítés
                </button>
              </div>

              {selectedStone ? (
                <div className="mt-4 flex flex-col gap-3 rounded-md border border-[var(--admin-line-100)] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
                      {previewProduct?.imageUrl ? (
                        <Image
                          src={previewProduct.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span
                          className="block h-full w-full"
                          style={{ background: selectedStone.colorHex || "#f5f3f0" }}
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="admin-eyebrow block">Storefront preview</span>
                      <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                        {selectedStone.name}
                      </span>
                      <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                        {previewProduct
                          ? `Kiemelt termék: ${previewProduct.name}`
                          : "Stone fallback fog megjelenni"}
                      </span>
                    </span>
                  </div>
                  {previewHref ? (
                    <Link
                      href={previewHref}
                      className="inline-flex min-h-8 shrink-0 items-center justify-center rounded border border-[var(--admin-line-100)] bg-white px-3 text-xs font-medium text-[var(--admin-ink-700)] transition hover:bg-[var(--admin-blue-050)]"
                    >
                      Megnyitás
                    </Link>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="grid gap-3">
                  <label className="grid gap-1.5">
                    <span className="admin-eyebrow">1. Stone, ez adja a card témáját</span>
                    <select
                      value={slot.stoneId}
                      onChange={(event) => {
                        const stoneId = event.target.value;
                        const nextStone = options.stones.find((stone) => stone.id === stoneId);
                        const currentProduct = options.products.find(
                          (product) => product.id === slot.productId,
                        );
                        const keepProduct =
                          nextStone && currentProduct && productHasStone(currentProduct, nextStone)
                            ? slot.productId
                            : "";

                        updateSlot(index, {
                          stoneId,
                          productId: keepProduct,
                          hasUnavailableFeaturedProduct: false,
                          unavailableFeaturedProductReason: null,
                        });
                      }}
                      className="admin-input min-h-10 px-3 text-sm"
                    >
                      <option value="">Válassz meglévő Stone-t</option>
                      {options.stones.map((stone) => (
                        <option key={stone.id} value={stone.id}>
                          {stone.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs leading-5 text-[var(--admin-ink-500)]">
                      Ez lesz a kártya címe és témája.
                    </span>
                  </label>

                  {selectedStone ? (
                    <div className="flex items-center gap-3 rounded-md border border-[var(--admin-line-100)] bg-white px-3 py-2">
                      <span
                        className="h-9 w-9 shrink-0 rounded border border-[var(--admin-line-100)]"
                        style={{ background: selectedStone.colorHex || "#f5f3f0" }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[var(--admin-ink-900)]">
                          {selectedStone.name}
                        </span>
                        <span className="block truncate text-xs text-[var(--admin-ink-500)]">
                          Storefront headline és fallback link: /stones#{selectedStone.slug}
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-1.5">
                  <span className="admin-eyebrow">2. Kiemelt Product, csak ehhez a Stone-hoz</span>
                  <span className="text-xs leading-5 text-[var(--admin-ink-500)]">
                    Opcionális kiemelt termék ehhez a kőhöz.
                  </span>
                  <ProductSlotPicker
                    disabled={!selectedStone}
                    products={compatibleProducts}
                    productId={productId}
                    stoneName={selectedStone?.name ?? "Stone"}
                    onChange={(nextProductId) =>
                      updateSlot(index, {
                        stoneId: slot.stoneId,
                        productId: nextProductId,
                        hasUnavailableFeaturedProduct: false,
                        unavailableFeaturedProductReason: null,
                      })
                    }
                  />
                  {slot.hasUnavailableFeaturedProduct ? (
                    <p className="text-xs font-medium text-amber-700">
                      A kiválasztott termék nem jelenik meg a webshopban
                      {slot.unavailableFeaturedProductReason
                        ? `: ${slot.unavailableFeaturedProductReason}`
                        : ""}
                      .
                      {productEditHref ? (
                        <Link
                          href={productEditHref}
                          className="ml-2 underline underline-offset-2"
                        >
                          Termék szerkesztése
                        </Link>
                      ) : null}
                    </p>
                  ) : isInvalidProduct ? (
                    <p className="text-xs font-medium text-amber-700">
                      A korábbi termék nem ehhez a Stone-hoz tartozik, ezért mentéskor törlődik.
                      {productEditHref ? (
                        <Link
                          href={productEditHref}
                          className="ml-2 underline underline-offset-2"
                        >
                          Termék szerkesztése
                        </Link>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </div>

              {isDuplicate ? (
                <p className="mt-3 text-xs font-medium text-amber-700">
                  Duplikált Stone. Mentéskor csak az első előfordulás marad meg.
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      <button type="submit" className="admin-button-primary admin-control-md mt-5">
        Válogatás mentése
      </button>
    </form>
  );
}
