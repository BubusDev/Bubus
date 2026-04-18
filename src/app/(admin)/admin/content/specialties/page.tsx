import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, Eye, ImageIcon, Plus, Save, Trash2 } from "lucide-react";

import { AdminBlobImageInput } from "@/components/admin/AdminBlobImageInput";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSpecialtyHref } from "@/lib/specialty-links";
import { db } from "@/lib/db";
import {
  createSpecialtyAction,
  deleteSpecialtyAction,
  updateSpecialtyAction,
} from "./actions";

type AdminSpecialtiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SpecialtyEditorItem = Awaited<ReturnType<typeof getSpecialties>>[number];

const inputClassName = "admin-input min-h-10 px-3 text-sm";
const textareaClassName = "admin-input min-h-24 px-3 py-2 text-sm";

function getErrorMessage(searchParams: Record<string, string | string[] | undefined>) {
  const error = searchParams.error;
  return typeof error === "string" ? error : null;
}

async function getSpecialties() {
  return db.specialty.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });
}

function destinationFor(item: Pick<SpecialtyEditorItem, "slug" | "destinationHref">) {
  return getSpecialtyHref({
    slug: item.slug,
    destinationHref: item.destinationHref,
  });
}

function Field({
  children,
  helper,
  label,
}: {
  children: ReactNode;
  helper?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="admin-eyebrow mb-1.5 block">{label}</span>
      {children}
      {helper ? (
        <span className="mt-1.5 block text-xs leading-5 text-[var(--admin-ink-500)]">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

function EditorSection({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="border border-[var(--admin-line-100)] bg-white/82 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)] sm:p-5">
      <p className="admin-eyebrow">{eyebrow}</p>
      <h3 className="mt-1 text-[1rem] font-semibold tracking-[-0.01em] text-[var(--admin-ink-900)]">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MissingNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm border border-[#ead6a7] bg-[#fff9e8] px-3 py-2 text-xs leading-5 text-[#765b18]">
      {children}
    </p>
  );
}

function SpecialtyPreview({ item }: { item: SpecialtyEditorItem }) {
  const href = destinationFor(item);
  const previewImage = item.previewImageUrl ?? item.imageUrl;
  const cardImage = item.cardImageUrl ?? previewImage;
  const cardTitle = item.cardTitle || item.name;
  const cardDescription = item.cardDescription || item.shortDescription;
  const ctaLabel = item.ctaLabel || "Kollekció megnyitása";

  return (
    <aside className="admin-panel-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="admin-eyebrow">Előnézeti kontextus</p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--admin-ink-900)]">
            Mega menu viselkedés
          </h3>
        </div>
        <span
          className={`rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            item.isVisible
              ? "border-[#bdd7c8] bg-[#f2faf5] text-[#24533a]"
              : "border-[var(--admin-line-200)] bg-white text-[var(--admin-ink-500)]"
          }`}
        >
          {item.isVisible ? "Látható" : "Rejtett"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--admin-ink-600)]">
            Középső preview
          </p>
          <div className="flex aspect-[3/4] max-h-64 items-center justify-center overflow-hidden rounded-sm border border-[var(--admin-line-100)] bg-[#f6edf3]">
            {previewImage ? (
              <img src={previewImage} alt={item.previewImageAlt || item.imageAlt || item.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-[#c7aaba]" />
            )}
          </div>
          {!previewImage ? <MissingNote>Hiányzik a preview kép. A storefront fallback vizuált mutat.</MissingNote> : null}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--admin-ink-600)]">
            Jobb oldali card
          </p>
          <div className="relative min-h-64 overflow-hidden rounded-sm bg-[radial-gradient(circle_at_70%_15%,#9b5a79_0%,#63324f_45%,#351925_100%)]">
            {cardImage ? (
              <img src={cardImage} alt={item.cardImageAlt || item.previewImageAlt || item.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2e1020]/90 via-[#3c1428]/52 to-[#3c1428]/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
              <p className="mb-2 self-start rounded-sm border border-white/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/80">
                Válogatás
              </p>
              <h4 className="line-clamp-2 break-words font-[family:var(--font-display)] text-lg font-semibold leading-tight">
                {cardTitle}
              </h4>
              {cardDescription ? (
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/80">{cardDescription}</p>
              ) : null}
              <p className="mt-3 line-clamp-1 break-all text-xs font-medium">{ctaLabel}</p>
            </div>
          </div>
          {!item.cardImageUrl ? <MissingNote>Hiányzik a card kép. A card a preview képet vagy fallback hátteret használ.</MissingNote> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--admin-ink-600)]">
        <span>{item._count.products} kapcsolt termék</span>
        <span aria-hidden="true">/</span>
        <Link href={href} className="inline-flex items-center gap-1 text-[var(--admin-blue-700)] hover:underline">
          {href}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}

function SpecialtyForm({
  formId,
  item,
  mode,
  nextSortOrder,
}: {
  formId: string;
  item?: SpecialtyEditorItem;
  mode: "create" | "update";
  nextSortOrder: number;
}) {
  const isCreate = mode === "create";
  const action = isCreate ? createSpecialtyAction : updateSpecialtyAction;
  const href = item ? destinationFor(item) : "/kulonlegessegek/[slug]";
  const previewImageUrl = item?.previewImageUrl ?? item?.imageUrl ?? "";
  const previewImageAlt = item?.previewImageAlt ?? item?.imageAlt ?? "";

  return (
    <form id={formId} action={action} className="space-y-5">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-5">
          <EditorSection eyebrow="01" title="Alapinformációk">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]">
              <Field label="Név">
                <input name="name" required defaultValue={item?.name ?? ""} placeholder="Kulcstartók" className={inputClassName} />
              </Field>
              <Field label="Slug" helper="Üresen hagyva új elemnél a névből készül.">
                <input name="slug" required={!isCreate} defaultValue={item?.slug ?? ""} placeholder="kulcstartok" className={inputClassName} />
              </Field>
              <Field label="Sorrend">
                <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? nextSortOrder} className={inputClassName} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection eyebrow="02" title="Storefront tartalom">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Jobb oldali card cím" helper="Ha üres, a specialty neve jelenik meg a mega menu jobb oldali kártyáján.">
                <input name="cardTitle" defaultValue={item?.cardTitle ?? ""} placeholder={item?.name ?? "Kulcstartók"} className={inputClassName} />
              </Field>
              <Field label="Card CTA szöveg" helper="Röviden tartsd. Hosszú szövegnél a storefront egy sorra vágja.">
                <input name="ctaLabel" defaultValue={item?.ctaLabel ?? ""} placeholder="Kollekció megnyitása" className={inputClassName} />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Rövid leírás" helper="A listing fejlécében és a mega menu középső preview szövegeként jelenik meg.">
                <textarea name="shortDescription" rows={4} defaultValue={item?.shortDescription ?? ""} className={textareaClassName} />
              </Field>
              <Field label="Jobb oldali card leírás" helper="Ha üres, a rövid leírás kerül a cardra. A storefront legfeljebb néhány sort mutat.">
                <textarea name="cardDescription" rows={4} defaultValue={item?.cardDescription ?? ""} className={textareaClassName} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="CTA céloldal override" helper={`Üresen az automatikus specialty listing nyílik meg: ${href}. Csak akkor töltsd ki, ha a card és menü linkje máshova vezessen.`}>
                <input name="destinationHref" defaultValue={item?.destinationHref ?? ""} placeholder="/kulonlegessegek/kulcstartok" className={inputClassName} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection eyebrow="03" title="Mega menu képek">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <div className="grid gap-2">
                  <span className="admin-eyebrow">Középső preview kép</span>
                  <p className="text-xs leading-5 text-[var(--admin-ink-500)]">
                    Ez a kép a mega menu középső paneljében jelenik meg. Ajánlott arány: közel négyzetes vagy enyhén álló, kb. 4:5.
                  </p>
                  <AdminBlobImageInput
                    name="previewImageUrl"
                    defaultUrl={previewImageUrl}
                    label="Középső preview kép feltöltése"
                    folder="specialties"
                    previewClassName="max-w-64 rounded-sm"
                    imageClassName="aspect-[3/4] w-full object-cover"
                  />
                </div>
                <Field label="Középső preview alt text" helper="A preview kép akadálymentes leírása. Ha üres és van kép, a specialty neve használható támpontnak.">
                  <input name="previewImageAlt" defaultValue={previewImageAlt} placeholder={item?.name ?? "Különlegesség preview"} className={inputClassName} />
                </Field>
                {previewImageUrl ? (
                  <label className="admin-checkbox-pill inline-flex min-h-10 items-center gap-2 px-3 text-sm">
                    <input name="clearPreviewImage" type="checkbox" className="h-4 w-4" />
                    Preview kép törlése
                  </label>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="grid gap-2">
                  <span className="admin-eyebrow">Jobb oldali card kép</span>
                  <p className="text-xs leading-5 text-[var(--admin-ink-500)]">
                    Ez a jobb oldali CTA card háttere. Ajánlott arány: szélesebb, banner jellegű kép, kb. 4:3.
                  </p>
                  <AdminBlobImageInput
                    name="cardImageUrl"
                    defaultUrl={item?.cardImageUrl ?? ""}
                    label="Jobb oldali card kép feltöltése"
                    folder="specialties"
                    previewClassName="max-w-64 rounded-sm"
                    imageClassName="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <Field label="Jobb oldali card alt text" helper="A card háttérkép leírása. Dekoratív kép esetén rövid, tárgyszerű szöveg elég.">
                  <input name="cardImageAlt" defaultValue={item?.cardImageAlt ?? ""} placeholder={item?.cardTitle || item?.name || "Különlegesség card"} className={inputClassName} />
                </Field>
                {item?.cardImageUrl ? (
                  <label className="admin-checkbox-pill inline-flex min-h-10 items-center gap-2 px-3 text-sm">
                    <input name="clearCardImage" type="checkbox" className="h-4 w-4" />
                    Card kép törlése
                  </label>
                ) : null}
              </div>
            </div>
          </EditorSection>

          <EditorSection eyebrow="04" title="Állapot / storefront viselkedés">
            <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
              <label className="admin-checkbox-pill inline-flex min-h-10 items-center gap-2 px-3 text-sm">
                <input name="isVisible" type="checkbox" defaultChecked={item?.isVisible ?? true} className="h-4 w-4" />
                Megjelenik a menüben és a storefronton
              </label>
              <p className="text-xs leading-5 text-[var(--admin-ink-600)]">
                A menü első nyitáskor az első látható, sorrend szerinti specialty-t választja ki automatikusan.
              </p>
            </div>
          </EditorSection>
        </div>

        {item ? (
          <SpecialtyPreview item={item} />
        ) : (
          <aside className="admin-panel-soft p-4">
            <p className="admin-eyebrow">Előnézeti kontextus</p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--admin-ink-900)]">
              Új specialty
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--admin-ink-600)]">
              Mentés után saját listing oldalt kap, és ha látható, megjelenik a Különlegességek mega menüben.
            </p>
          </aside>
        )}
      </div>
    </form>
  );
}

export default async function AdminSpecialtiesPage({
  searchParams,
}: AdminSpecialtiesPageProps) {
  const [items, resolvedSearchParams] = await Promise.all([
    getSpecialties(),
    searchParams,
  ]);
  const errorMessage = getErrorMessage(resolvedSearchParams);

  return (
    <AdminShell title="Különlegességek navigáció">
      <div className="space-y-6">
        {errorMessage ? (
          <div className="rounded-md border border-[#e3c7cf] bg-[#fff1f3] px-4 py-3 text-sm text-[#99283d]">
            {errorMessage}
          </div>
        ) : null}

        <div className="admin-panel-muted px-4 py-3 text-sm leading-6 text-[var(--admin-ink-700)]">
          A Különlegességek mega menu specialty-specifikus: a bal oldali választás határozza meg a középső preview képet, a jobb oldali cardot és a CTA céloldalt.
        </div>

        <section className="admin-panel p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[var(--admin-blue-700)]" />
                <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">
                  Új specialty létrehozása
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--admin-ink-600)]">
                A slug alapján automatikusan létrejön a publikus specialty listing.
              </p>
            </div>
            <button type="submit" form="specialty-create-form" className="admin-button-primary admin-control-md gap-2">
              <Save className="h-4 w-4" />
              Létrehozás
            </button>
          </div>
          <SpecialtyForm formId="specialty-create-form" mode="create" nextSortOrder={items.length} />
        </section>

        {items.length === 0 ? (
          <div className="admin-panel-muted p-5 text-sm text-[var(--admin-ink-600)]">
            Még nincs kezelhető elem. Amíg nincs látható elem, a Különlegességek menüpont nem jelenik meg a webshop navigációjában.
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => {
              const formId = `specialty-item-${item.id}`;

              return (
                <section key={item.id} className="admin-panel p-5">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="admin-eyebrow">Specialty editor</p>
                      <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-[-0.01em] text-[var(--admin-ink-900)]">
                        {item.name}
                        {item.isVisible ? <Eye className="h-4 w-4 text-[#24533a]" /> : null}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="submit" form={formId} className="admin-button-primary admin-control-sm gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        Mentés
                      </button>
                      <form action={deleteSpecialtyAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="admin-button-danger admin-control-sm gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                          Törlés
                        </button>
                      </form>
                    </div>
                  </div>

                  <SpecialtyForm formId={formId} item={item} mode="update" nextSortOrder={items.length} />
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
