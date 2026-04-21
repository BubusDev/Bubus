"use client";

import Image from "next/image";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  saveHomepageBlockAction,
  saveHomepagePromoTileAction,
} from "@/app/(admin)/admin/content/homepage/actions";
import { AdminBlobImageInput } from "@/components/admin/AdminBlobImageInput";
import { HomepageMaterialPicksEditor } from "@/components/admin/HomepageMaterialPicksEditor";
import type {
  HomepageBlockView,
  HomepageContentView,
  HomepageMaterialPickOptions,
  HomepagePromoTileView,
} from "@/lib/homepage-content";

type AdminHomepageContentFormProps = {
  content: HomepageContentView;
  materialPickOptions: HomepageMaterialPickOptions;
};

type PanelState =
  | { type: "block"; block: HomepageBlockView }
  | { type: "tile"; tile: HomepagePromoTileView }
  | null;

const inputClass =
  "w-full rounded-lg border border-[var(--admin-line-200)] bg-white px-3 py-2 text-sm text-[var(--admin-ink-900)] outline-none transition focus:border-[var(--admin-blue-500)] focus:ring-2 focus:ring-[var(--admin-blue-100)]";

function BlockPanel({
  block,
  onClose,
  onSaved,
}: {
  block: HomepageBlockView;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const sectionLabel = block.key === "HERO" ? "Campaign" : "Social";
  const title = block.key === "HERO" ? "Hero kampány blokk" : "Instagram promó blokk";

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/35">
      <div className="ml-auto flex h-full w-full max-w-3xl flex-col bg-[var(--admin-surface-050)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--admin-ink-500)]">
              {sectionLabel}
            </p>
            <h2 className="text-lg font-semibold text-[var(--admin-ink-900)]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="admin-button-secondary admin-control-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setError("");
            startTransition(async () => {
              const result = await saveHomepageBlockAction(formData);
              if (!result.ok) {
                setError(result.message);
                return;
              }
              onSaved(result.message);
            });
          }}
        >
          <input type="hidden" name="key" value={block.key} />
          <input type="hidden" name="imageUrl" value={block.imageUrl} />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Eyebrow
              </label>
              <input name="eyebrow" defaultValue={block.eyebrow} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Cím
              </label>
              <input name="title" defaultValue={block.title} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Gomb szöveg
              </label>
              <input name="buttonText" defaultValue={block.buttonText} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Gomb link
              </label>
              <input name="buttonHref" defaultValue={block.buttonHref} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Kép alt szöveg
              </label>
              <input name="imageAlt" defaultValue={block.imageAlt} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
              Támogató szöveg
            </label>
            <textarea name="body" defaultValue={block.body} rows={4} className={inputClass} />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--admin-ink-700)]">Kép</p>
            {block.imageUrl && (
              <div className="mb-3 overflow-hidden rounded-md border border-[var(--admin-line-100)]">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={block.imageUrl}
                    alt={block.imageAlt || title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
            <AdminBlobImageInput name="newImageUrl" label="Új kép feltöltése" folder="homepage" />
            <p className="mt-1.5 text-xs text-[var(--admin-ink-500)]">
              Ha nem választasz új képet, a jelenlegi kép marad.
            </p>
          </div>

          <label className="admin-checkbox-pill inline-flex min-h-11 items-center gap-3 px-3.5 text-sm">
            <input
              type="checkbox"
              name="isVisible"
              defaultChecked={block.isVisible}
              className="h-4 w-4"
            />
            Látható a kezdőlapon
          </label>

          <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-6 py-4">
            <button type="button" onClick={onClose} className="admin-button-secondary admin-control-md">
              Mégse
            </button>
            <button type="submit" disabled={isPending} className="admin-button-primary admin-control-md">
              {isPending ? "Mentés..." : "Blokk mentése"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PromoTilePanel({
  tile,
  onClose,
  onSaved,
}: {
  tile: HomepagePromoTileView;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/35">
      <div className="ml-auto flex h-full w-full max-w-3xl flex-col bg-[var(--admin-surface-050)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--admin-ink-500)]">
              Promo grid · Slot {tile.slotIndex}
            </p>
            <h2 className="text-lg font-semibold text-[var(--admin-ink-900)]">
              {tile.title || "Csempe szerkesztése"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="admin-button-secondary admin-control-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setError("");
            startTransition(async () => {
              const result = await saveHomepagePromoTileAction(formData);
              if (!result.ok) {
                setError(result.message);
                return;
              }
              onSaved(result.message);
            });
          }}
        >
          <input type="hidden" name="slotIndex" value={tile.slotIndex} />
          <input type="hidden" name="imageUrl" value={tile.imageUrl} />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Cím
              </label>
              <input name="title" defaultValue={tile.title} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Alcím
              </label>
              <input name="subtitle" defaultValue={tile.subtitle} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Link
              </label>
              <input name="href" defaultValue={tile.href} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-ink-700)]">
                Kép alt szöveg
              </label>
              <input name="imageAlt" defaultValue={tile.imageAlt} className={inputClass} />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--admin-ink-700)]">Kép</p>
            {tile.imageUrl && (
              <div className="mb-3 overflow-hidden rounded-md border border-[var(--admin-line-100)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={tile.imageUrl}
                    alt={tile.imageAlt || tile.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
            <AdminBlobImageInput name="newImageUrl" label="Új kép feltöltése" folder="homepage" />
          </div>

          <label className="admin-checkbox-pill inline-flex min-h-11 items-center gap-3 px-3.5 text-sm">
            <input
              type="checkbox"
              name="isVisible"
              defaultChecked={tile.isVisible}
              className="h-4 w-4"
            />
            Látható a kezdőlapon
          </label>

          <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-[var(--admin-line-100)] bg-[var(--admin-surface-050)] px-6 py-4">
            <button type="button" onClick={onClose} className="admin-button-secondary admin-control-md">
              Mégse
            </button>
            <button type="submit" disabled={isPending} className="admin-button-primary admin-control-md">
              {isPending ? "Mentés..." : "Csempe mentése"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BlockOverviewCard({
  block,
  label,
  title,
  onEdit,
}: {
  block: HomepageBlockView;
  label: string;
  title: string;
  onEdit: () => void;
}) {
  return (
    <div className="admin-panel p-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="admin-eyebrow">{label}</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--admin-ink-900)]">{title}</h2>
              {block.title && (
                <p className="mt-1 max-w-[48ch] text-sm text-[var(--admin-ink-600)]">
                  &ldquo;{block.title}&rdquo;
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="admin-button-secondary admin-control-md shrink-0"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
                block.isVisible
                  ? "bg-green-50 text-green-700"
                  : "bg-[var(--admin-surface-100)] text-[var(--admin-ink-500)]"
              }`}
            >
              {block.isVisible ? "Látható" : "Rejtett"}
            </span>
            {block.buttonText && (
              <span className="inline-flex items-center rounded-full bg-[var(--admin-surface-100)] px-2.5 py-1 text-xs text-[var(--admin-ink-500)]">
                Gomb: {block.buttonText}
              </span>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
          {block.imageUrl ? (
            <div className="relative aspect-[16/10]">
              <Image
                src={block.imageUrl}
                alt={block.imageAlt || title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center px-4 text-center text-sm text-[var(--admin-ink-500)]">
              Nincs kép megadva
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TileOverviewCard({
  tile,
  onEdit,
}: {
  tile: HomepagePromoTileView;
  onEdit: () => void;
}) {
  return (
    <div className="admin-panel-soft p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--admin-line-100)] bg-[var(--admin-surface-050)]">
            {tile.imageUrl ? (
              <Image
                src={tile.imageUrl}
                alt={tile.imageAlt || tile.title}
                fill
                className="object-cover"
                unoptimized
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--admin-ink-500)]">
                Nincs
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="admin-eyebrow">Slot {tile.slotIndex}</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-[var(--admin-ink-900)]">
              {tile.title || "Nincs cím"}
            </h3>
            {tile.subtitle && (
              <p className="truncate text-xs text-[var(--admin-ink-500)]">{tile.subtitle}</p>
            )}
            <span
              className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                tile.isVisible
                  ? "bg-green-50 text-green-700"
                  : "bg-[var(--admin-surface-100)] text-[var(--admin-ink-500)]"
              }`}
            >
              {tile.isVisible ? "Látható" : "Rejtett"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="admin-button-secondary admin-control-sm shrink-0"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
}

export function AdminHomepageContentForm({
  content,
  materialPickOptions,
}: AdminHomepageContentFormProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<PanelState>(null);
  const [toast, setToast] = useState("");

  const panelKey = panel
    ? panel.type === "block"
      ? panel.block.key
      : `tile-${panel.tile.slotIndex}`
    : "closed";

  function handleSaved(message: string) {
    setToast(message);
    setPanel(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {toast && (
        <p className="admin-panel-muted px-4 py-3 text-sm text-[var(--admin-ink-700)]">{toast}</p>
      )}

      <BlockOverviewCard
        block={content.hero}
        label="Campaign"
        title="Hero kampány blokk"
        onEdit={() => setPanel({ type: "block", block: content.hero })}
      />

      <BlockOverviewCard
        block={content.instagram}
        label="Social"
        title="Instagram promó blokk"
        onEdit={() => setPanel({ type: "block", block: content.instagram })}
      />

      <HomepageMaterialPicksEditor picks={content.materialPicks} options={materialPickOptions} />

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
            <TileOverviewCard
              key={tile.slotIndex}
              tile={tile}
              onEdit={() => setPanel({ type: "tile", tile })}
            />
          ))}
        </div>
      </section>

      {panel?.type === "block" && (
        <BlockPanel
          key={panelKey}
          block={panel.block}
          onClose={() => setPanel(null)}
          onSaved={handleSaved}
        />
      )}
      {panel?.type === "tile" && (
        <PromoTilePanel
          key={panelKey}
          tile={panel.tile}
          onClose={() => setPanel(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
