import Image from "next/image";

import {
  saveHomepageBlockAction,
  saveHomepagePromoTileAction,
} from "@/app/(admin)/admin/content/homepage/actions";
import type {
  HomepageBlockView,
  HomepageContentView,
  HomepagePromoTileView,
} from "@/lib/homepage-content";

type AdminHomepageContentFormProps = {
  content: HomepageContentView;
};

function TextField({
  defaultValue,
  label,
  name,
  placeholder,
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="admin-eyebrow">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="admin-input min-h-11 px-3.5 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  defaultValue,
  label,
  name,
  placeholder,
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="admin-eyebrow">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={4}
        className="admin-textarea min-h-28 px-3.5 py-3 text-sm"
      />
    </label>
  );
}

function VisibilityField({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <label className="admin-checkbox-pill inline-flex min-h-11 items-center gap-3 px-3.5 text-sm">
      <input
        type="checkbox"
        name="isVisible"
        defaultChecked={defaultChecked}
        className="h-4 w-4"
      />
      Látható a kezdőlapon
    </label>
  );
}

function ImagePreview({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
      {src ? (
        <div className="relative aspect-[16/10]">
          <Image src={src} alt={alt} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center px-4 text-center text-sm text-[var(--admin-ink-500)]">
          Nincs kép megadva
        </div>
      )}
    </div>
  );
}

function ImageUploadField() {
  return (
    <label className="grid gap-2">
      <span className="admin-eyebrow">Kép feltöltése</span>
      <input
        type="file"
        name="imageFile"
        accept="image/*"
        className="admin-input min-h-11 px-3.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--admin-ink-900)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
      />
      <span className="text-xs leading-5 text-[var(--admin-ink-500)]">
        Ha nem választasz új képet, a jelenlegi kép marad használatban.
      </span>
    </label>
  );
}

function HomepageBlockForm({
  block,
  helper,
  title,
}: {
  block: HomepageBlockView;
  helper: string;
  title: string;
}) {
  return (
    <form action={saveHomepageBlockAction} className="admin-panel p-5" encType="multipart/form-data">
      <input type="hidden" name="key" value={block.key} />
      <input type="hidden" name="imageUrl" value={block.imageUrl} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="admin-eyebrow">{block.key === "HERO" ? "Campaign" : "Social"}</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--admin-ink-900)]">{title}</h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-6 text-[var(--admin-ink-600)]">
            {helper}
          </p>
        </div>
        <ImagePreview src={block.imageUrl} alt={block.imageAlt || title} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TextField name="eyebrow" label="Eyebrow" defaultValue={block.eyebrow} />
        <TextField name="title" label="Cím" defaultValue={block.title} />
        <TextField name="buttonText" label="Gomb szöveg" defaultValue={block.buttonText} />
        <TextField name="buttonHref" label="Gomb link" defaultValue={block.buttonHref} />
        <TextField name="imageAlt" label="Kép alt szöveg" defaultValue={block.imageAlt} />
        <ImageUploadField />
      </div>

      <div className="mt-4">
        <TextAreaField name="body" label="Támogató szöveg" defaultValue={block.body} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <VisibilityField defaultChecked={block.isVisible} />
        <button type="submit" className="admin-button-primary admin-control-md">
          Blokk mentése
        </button>
      </div>
    </form>
  );
}

function PromoTileForm({ tile }: { tile: HomepagePromoTileView }) {
  return (
    <form
      action={saveHomepagePromoTileAction}
      className="admin-panel-soft p-4"
      encType="multipart/form-data"
    >
      <input type="hidden" name="slotIndex" value={tile.slotIndex} />
      <input type="hidden" name="imageUrl" value={tile.imageUrl} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Slot {tile.slotIndex}</p>
          <h3 className="mt-1 text-base font-semibold text-[var(--admin-ink-900)]">
            {tile.title}
          </h3>
        </div>
        <div className="w-24 shrink-0">
          <ImagePreview src={tile.imageUrl} alt={tile.imageAlt || tile.title} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <TextField name="title" label="Cím" defaultValue={tile.title} />
        <TextField name="subtitle" label="Alcím" defaultValue={tile.subtitle} />
        <TextField name="href" label="Link" defaultValue={tile.href} />
        <TextField name="imageAlt" label="Kép alt szöveg" defaultValue={tile.imageAlt} />
        <ImageUploadField />
        <VisibilityField defaultChecked={tile.isVisible} />
      </div>

      <button type="submit" className="admin-button-secondary admin-control-sm mt-4">
        Csempe mentése
      </button>
    </form>
  );
}

export function AdminHomepageContentForm({ content }: AdminHomepageContentFormProps) {
  return (
    <div className="space-y-6">
      <HomepageBlockForm
        block={content.hero}
        title="Hero kampány blokk"
        helper="A kezdőlap nagy felső kampányképe. A teljes hero blokk a megadott linkre visz."
      />

      <HomepageBlockForm
        block={content.instagram}
        title="Instagram promó blokk"
        helper="A zöldes hangulatú social promó blokk képe, szövege és cél URL-je."
      />

      <section className="admin-panel p-5">
        <div className="mb-5">
          <p className="admin-eyebrow">Promo grid</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--admin-ink-900)]">
            Saját tervezésű kollekciók
          </h2>
          <p className="mt-2 max-w-[64ch] text-sm leading-6 text-[var(--admin-ink-600)]">
            Az öt kép slotja explicit 4-8 pozícióval kezelhető, így a storefront elrendezése stabil
            marad kampánycsere közben is.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {content.promoTiles.map((tile) => (
            <PromoTileForm key={tile.slotIndex} tile={tile} />
          ))}
        </div>
      </section>
    </div>
  );
}
