import Link from "next/link";

import {
  createSpecialEditionEntryAction,
  deleteSpecialEditionEntryAction,
  updateSpecialEditionBannerAction,
  updateSpecialEditionCampaignStateAction,
  updateSpecialEditionEntryAction,
} from "@/app/(admin)/admin/special-edition/actions";
import type {
  AdminSpecialEditionCampaignValues,
} from "@/lib/products";

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
      <span className="text-sm font-medium text-[#5a374e]">Product</span>
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
        <img src={src} alt={alt} className="aspect-[4/3] w-full object-cover" />
      </div>
    </div>
  );
}

function ImageField({
  label,
  inputName,
  altName,
  defaultAlt,
  helper,
  required = false,
}: {
  label: string;
  inputName: string;
  altName: string;
  defaultAlt?: string;
  helper: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="space-y-2">
        <span className="text-sm font-medium text-[#5a374e]">{label}</span>
        <input
          type="file"
          name={inputName}
          accept="image/*"
          required={required}
          className="block w-full rounded-2xl border border-[#edd1e1] bg-white px-4 py-3 text-sm text-[#4d2741] file:mr-4 file:rounded-full file:border-0 file:bg-[#f183bc] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-[#5a374e]">{label} alt text</span>
        <input
          type="text"
          name={altName}
          defaultValue={defaultAlt ?? ""}
          placeholder={helper}
          className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
        />
      </label>
      <p className="text-xs leading-5 text-[#7a6070]">{helper}</p>
    </div>
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
              Campaign State
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Special Edition</h2>
            <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[#765f6d]">
              Control whether the Special Edition campaign is live in the storefront navigation.
              When inactive, the category link and the page both disappear.
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
              Campaign active
            </label>
            <button
              type="submit"
              className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-[#5E0034] px-5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Save campaign state
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">Campaign Banner</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Special Edition Banner Image</h2>
        <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[#765f6d]">
          Upload the single full-width banner shown above the Special Edition content. This image is stored separately from product gallery images and only applies to the Special Edition campaign.
        </p>

        <form action={updateSpecialEditionBannerAction} className="mt-6 space-y-5">
          <input type="hidden" name="currentBannerImageUrl" value={campaign.bannerImageUrl} />

          {hasBannerImage ? (
            <ImagePreview
              label="Current banner image"
              src={campaign.bannerImageUrl}
              alt={campaign.bannerImageAlt || "Special Edition banner"}
            />
          ) : (
            <div className="border border-dashed border-[#ebcede] bg-[#fff8fb] px-5 py-4 text-sm text-[#765f6d]">
              No campaign image set
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <ImageField
              label="Special Edition Banner Image"
              inputName="bannerImage"
              altName="bannerImageAlt"
              defaultAlt={campaign.bannerImageAlt}
              helper="Wide editorial banner displayed directly below the category navigation."
            />
            <div className="border border-dashed border-[#ebcede] bg-[#fff8fb] px-5 py-4 text-sm leading-7 text-[#765f6d]">
              {!hasBannerImage ? "Preferred: upload a banner image so the storefront campaign opens with a full-width visual." : "Leave the file empty to keep the current banner image."}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#5E0034] px-5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Save banner image
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">New Entry</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Add campaign entry</h2>
        <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[#765f6d]">
          This form is separate from the main product admin. Pick the product, upload the left
          promo image, upload the right product image, and define the display order.
        </p>

        <form action={createSpecialEditionEntryAction} className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ProductSelect products={products} />
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#5a374e]">Sort order</span>
              <input
                type="number"
                name="sortOrder"
                defaultValue={campaign.entries.length}
                className="h-12 w-full rounded-2xl border border-[#edd1e1] bg-white px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#e9b6d0]"
              />
            </label>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ImageField
              label="Left-side promo image"
              inputName="promoImage"
              altName="promoImageAlt"
              helper="Shown on the left side of the Special Edition layout."
              required
            />
            <ImageField
              label="Right-side product image"
              inputName="productImage"
              altName="productImageAlt"
              helper="Shown on the right side above the product details."
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.28)] transition hover:bg-[#ea6fb0]"
          >
            Create entry
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
              Existing Entries
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#4d2741]">Manage entries</h2>
          </div>
          <p className="text-sm text-[#765f6d]">{campaign.entries.length} entries</p>
        </div>

        <div className="mt-6 space-y-6">
          {campaign.entries.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-[#ebcede] bg-[#fff8fb] px-6 py-10 text-center text-sm leading-7 text-[#765f6d]">
              No Special Edition entries yet.
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
                    View product
                  </Link>
                  <form action={deleteSpecialEditionEntryAction}>
                    <input type="hidden" name="entryId" value={entry.id} />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#f1cedf] bg-[#fff3f8] px-4 text-sm font-medium text-[#9b476f] transition hover:bg-[#ffe8f2]"
                    >
                      Delete
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
                    <span className="text-sm font-medium text-[#5a374e]">Sort order</span>
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
                    label="Current left promo image"
                    src={entry.promoImageUrl}
                    alt={entry.promoImageAlt}
                  />
                  <ImagePreview
                    label="Current right product image"
                    src={entry.productImageUrl}
                    alt={entry.productImageAlt}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <ImageField
                    label="Replace left-side promo image"
                    inputName="promoImage"
                    altName="promoImageAlt"
                    defaultAlt={entry.promoImageAlt}
                    helper="Leave the file empty to keep the current left-side promo image."
                  />
                  <ImageField
                    label="Replace right-side product image"
                    inputName="productImage"
                    altName="productImageAlt"
                    defaultAlt={entry.productImageAlt}
                    helper="Leave the file empty to keep the current right-side product image."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#5E0034] px-5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Save entry
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
