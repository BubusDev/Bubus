import Link from "next/link";
import Image from "next/image";

import {
  createSpecialEditionEntryAction,
  deleteSpecialEditionEntryAction,
  updateSpecialEditionBannerAction,
  updateSpecialEditionCampaignStateAction,
  updateSpecialEditionEntryAction,
} from "@/app/(admin)/admin/special-edition/actions";
import { AdminBlobImageInput } from "@/components/admin/AdminBlobImageInput";
import type {
  AdminSpecialEditionCampaignValues,
} from "@/lib/products-client";

type SelectableProduct = {
  id: string;
  name: string;
  slug: string;
};

type AdminSpecialEditionManagerProps = {
  campaign: AdminSpecialEditionCampaignValues;
  products: SelectableProduct[];
};

function ProductSelect({
  defaultValue,
  products,
}: {
  defaultValue?: string;
  products: SelectableProduct[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#5a374e]">Termék</span>
      <select
        name="productId"
        defaultValue={defaultValue ?? products[0]?.id ?? ""}
        className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
      >
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.slug})
          </option>
        ))}
      </select>
    </label>
  );
}

function ImagePreview({
  label,
  src,
  alt,
}: {
  label: string;
  src: string;
  alt: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#5a374e]">{label}</p>
      <div className="overflow-hidden rounded-[1.5rem] border border-[#f0d8e5] bg-[#fff7fb]">
        <Image src={src} alt={alt} width={960} height={720} className="aspect-[4/3] w-full object-cover" unoptimized />
      </div>
    </div>
  );
}

function AltTextField({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#5a374e]">{label} alt text</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
      />
    </label>
  );
}

export function AdminSpecialEditionManager({
  campaign,
  products,
}: AdminSpecialEditionManagerProps) {
  const hasBannerImage = campaign.bannerImageUrl.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
              Kampány állapota
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Special Edition</h2>
            <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[#765f6d]">
              Itt állítható, hogy a Special Edition kampány látszik-e a storefront navigációban.
              Inaktív állapotban a kategórialink és a kampányoldal sem jelenik meg.
            </p>
          </div>

          <form action={updateSpecialEditionCampaignStateAction} className="min-w-[280px]">
            <label className="flex items-center gap-3 rounded-full border border-[#ecd3e3] bg-[#fff7fb] px-4 py-3 text-sm font-medium text-[#6b425a]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={campaign.isActive}
                className="h-4 w-4 rounded border-[#d7a8c1] text-[#5E0034]"
              />
              Kampány aktív
            </label>
            <button
              type="submit"
              className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-[#5E0034] px-5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Kampányállapot mentése
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">Kampány banner</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Special Edition bannerkép</h2>
        <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[#765f6d]">
          Ez az egy teljes szélességű kép jelenik meg a Special Edition tartalom felett. Külön tárolódik a termékképektől, és csak erre a kampányra vonatkozik.
        </p>

        <form action={updateSpecialEditionBannerAction} className="mt-6 space-y-5">
          <input type="hidden" name="currentBannerImageUrl" value={campaign.bannerImageUrl} />

          {hasBannerImage ? (
            <ImagePreview
              label="Jelenlegi bannerkép"
              src={campaign.bannerImageUrl}
              alt={campaign.bannerImageAlt || "Special Edition banner"}
            />
          ) : (
            <div className="border border-dashed border-[#ebcede] bg-[#fff8fb] px-5 py-4 text-sm text-[#765f6d]">
              Nincs kampánykép beállítva
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <AdminBlobImageInput
                name="newBannerImageUrl"
                label="Új Special Edition bannerkép"
                folder="special-edition"
              />
              <AltTextField
                name="bannerImageAlt"
                label="Banner"
                defaultValue={campaign.bannerImageAlt}
                placeholder="Széles editorial banner a kategória navigáció alatt."
              />
              <p className="text-xs leading-5 text-[#7a6070]">
                Széles editorial banner a kategória navigáció alatt.
              </p>
            </div>
            <div className="border border-dashed border-[#ebcede] bg-[#fff8fb] px-5 py-4 text-sm leading-7 text-[#765f6d]">
              {!hasBannerImage
                ? "Javasolt bannerképet feltölteni, hogy a kampány teljes szélességű vizuállal induljon."
                : "Hagyd üresen a fájlmezőt, ha a jelenlegi bannerképet szeretnéd megtartani."}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#5E0034] px-5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Bannerkép mentése
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">Új elem</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Kampányelem hozzáadása</h2>
        <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[#765f6d]">
          Ez a forma külön kezeli a kampány megjelenését a fő termékadmintól. Válassz terméket,
          tölts fel bal oldali promóképet és jobb oldali termékképet, majd add meg a sorrendet.
        </p>

        <form action={createSpecialEditionEntryAction} className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ProductSelect products={products} />
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#5a374e]">Sorrend</span>
              <input
                type="number"
                name="sortOrder"
                defaultValue={campaign.entries.length}
                className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
              />
            </label>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <AdminBlobImageInput
                name="promoImageUrl"
                label="Bal oldali promókép"
                folder="special-edition"
              />
              <AltTextField
                name="promoImageAlt"
                label="Promo"
                placeholder="A Special Edition layout bal oldalán jelenik meg."
              />
              <p className="text-xs leading-5 text-[#7a6070]">
                A Special Edition layout bal oldalán jelenik meg.
              </p>
            </div>
            <div className="space-y-3">
              <AdminBlobImageInput
                name="productImageUrl"
                label="Jobb oldali termékkép"
                folder="special-edition"
              />
              <AltTextField
                name="productImageAlt"
                label="Termék"
                placeholder="A jobb oldalon, a termékrészletek felett jelenik meg."
              />
              <p className="text-xs leading-5 text-[#7a6070]">
                A jobb oldalon, a termékrészletek felett jelenik meg.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Kampányelem létrehozása
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
              Meglévő elemek
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Kampányelemek kezelése</h2>
          </div>
          <p className="text-sm text-[#765f6d]">{campaign.entries.length} elem</p>
        </div>

        <div className="mt-6 space-y-6">
          {campaign.entries.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-[#ebcede] bg-[#fff8fb] px-6 py-10 text-center text-sm leading-7 text-[#765f6d]">
              Még nincs Special Edition kampányelem.
            </div>
          ) : null}

          {campaign.entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[1.8rem] border border-[#efd8e5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,250,0.94))] p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#4d2741]">{entry.productName}</h3>
                  <p className="mt-1 text-sm text-[#7a6070]">/{entry.productSlug}</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/product/${entry.productSlug}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[#ecd3e3] bg-white px-4 text-sm font-medium text-[#6b425a] transition hover:border-[#e9b6d0]"
                  >
                    Termék megnyitása
                  </Link>
                  <form action={deleteSpecialEditionEntryAction}>
                    <input type="hidden" name="entryId" value={entry.id} />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#f1cedf] bg-[#fff3f8] px-4 text-sm font-medium text-[#9b476f] transition hover:bg-[#ffe8f2]"
                    >
                      Törlés
                    </button>
                  </form>
                </div>
              </div>

              <form action={updateSpecialEditionEntryAction} className="mt-5 space-y-5">
                <input type="hidden" name="entryId" value={entry.id} />
                <input type="hidden" name="currentPromoImageUrl" value={entry.promoImageUrl} />
                <input type="hidden" name="currentProductImageUrl" value={entry.productImageUrl} />

                <div className="grid gap-5 lg:grid-cols-2">
                  <ProductSelect defaultValue={entry.productId} products={products} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#5a374e]">Sorrend</span>
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={entry.sortOrder}
                      className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
                    />
                  </label>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <ImagePreview
                    label="Jelenlegi bal oldali promókép"
                    src={entry.promoImageUrl}
                    alt={entry.promoImageAlt}
                  />
                  <ImagePreview
                    label="Jelenlegi jobb oldali termékkép"
                    src={entry.productImageUrl}
                    alt={entry.productImageAlt}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-3">
                    <AdminBlobImageInput
                      name="newPromoImageUrl"
                      label="Bal oldali promókép cseréje"
                      folder="special-edition"
                    />
                    <AltTextField
                      name="promoImageAlt"
                      label="Promó"
                      defaultValue={entry.promoImageAlt}
                      placeholder="Hagyd üresen, ha a jelenlegi bal oldali promóképet megtartanád."
                    />
                    <p className="text-xs leading-5 text-[#7a6070]">
                      Hagyd üresen, ha a jelenlegi bal oldali promóképet megtartanád.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <AdminBlobImageInput
                      name="newProductImageUrl"
                      label="Jobb oldali termékkép cseréje"
                      folder="special-edition"
                    />
                    <AltTextField
                      name="productImageAlt"
                      label="Termék"
                      defaultValue={entry.productImageAlt}
                      placeholder="Hagyd üresen, ha a jelenlegi jobb oldali termékképet megtartanád."
                    />
                    <p className="text-xs leading-5 text-[#7a6070]">
                      Hagyd üresen, ha a jelenlegi jobb oldali termékképet megtartanád.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#5E0034] px-5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Kampányelem mentése
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
