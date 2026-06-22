"use client";

import { upload } from "@vercel/blob/client";
import { ChevronDown, ChevronUp, Edit3, ImageIcon, Save, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";

import { updateHomepageContentAction } from "@/app/(admin)/admin/content/homepage/actions";
import FeaturedSlider from "@/components/home/FeaturedSlider";
import HeroBanner from "@/components/home/HeroBanner";
import { HomeEditorialSection, HomeFinalCta } from "@/components/home/HomeEditorialSection";
import { HomeInstagramPromo } from "@/components/home/HomeInstagramPromo";
import { HomeNewsletterBlock } from "@/components/home/HomeNewsletterBlock";
import { HomePromoTileGrid } from "@/components/home/HomePromoTileGrid";
import { createAdminImageUploadPathname } from "@/lib/blob-upload";
import { formatPrice } from "@/lib/catalog";
import type {
  HomepageBlockView,
  HomepageContentView,
  HomepageMaterialPickView,
  HomepagePromoTileView,
} from "@/lib/homepage-content";
import type { AdminShowcaseProductOption, ShowcaseTab } from "@/lib/homepage-showcase";
import { browserSafeProductImageAccept, getBrowserDisplayImageUrl } from "@/lib/image-safety";

type EditableSection = "hero" | "featureBar" | "categoryGrid" | "featuredSlider" | "social" | "newsletter";

type HomepageInlineEditorProps = {
  initialContent: HomepageContentView;
  newsletterStatus?: string;
  showcaseTabs: ShowcaseTab[];
  productOptions: AdminShowcaseProductOption[];
  initialFeaturedProductIds: string[];
  initialMaterialProductIds: string[];
};

const sectionLabels: Record<EditableSection, string> = {
  hero: "Hero",
  featureBar: "Feature bar",
  categoryGrid: "Kategóriák",
  featuredSlider: "Featured slider",
  social: "Social",
  newsletter: "Newsletter",
};

const editableSections: EditableSection[] = [
  "hero",
  "featureBar",
  "categoryGrid",
  "featuredSlider",
  "social",
  "newsletter",
];

function cloneContent(content: HomepageContentView): HomepageContentView {
  return JSON.parse(JSON.stringify(content)) as HomepageContentView;
}

function getMetadataString(block: HomepageBlockView, key: string, fallback = "") {
  const value = block.metadata[key];
  return typeof value === "string" ? value : fallback;
}

function getFeatures(block: HomepageBlockView) {
  const items = Array.isArray(block.metadata.features) ? block.metadata.features : [];
  const features = items.map((item) => {
    const value = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      label: typeof value.label === "string" ? value.label : "",
      text: typeof value.text === "string" ? value.text : "",
    };
  });

  return Array.from({ length: 3 }, (_, index) => features[index] ?? { label: "", text: "" });
}

function getPerks(block: HomepageBlockView) {
  const perks = Array.isArray(block.metadata.perks)
    ? block.metadata.perks.map((perk) => (typeof perk === "string" ? perk : ""))
    : [];

  return Array.from({ length: 3 }, (_, index) => perks[index] ?? "");
}

function getTeamMembers(block: HomepageBlockView) {
  const items = Array.isArray(block.metadata.teamMembers) ? block.metadata.teamMembers : [];
  const teamMembers = items.map((item) => {
    const value = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      name: typeof value.name === "string" ? value.name : "",
      role: typeof value.role === "string" ? value.role : "",
      imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : "",
    };
  });

  return Array.from(
    { length: 3 },
    (_, index) => teamMembers[index] ?? { name: "", role: "", imageUrl: "" },
  );
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-md border border-[#e4c8d2] bg-white px-3 py-2 text-sm text-[#2D1A16] outline-none focus:border-[#E0157A] focus:ring-2 focus:ring-[#E0157A]/15";

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8f5367]">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={className} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#6B3D52]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#E0157A]"
      />
      {label}
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  previewAlt = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  previewAlt?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const displayUrl = getBrowserDisplayImageUrl(value);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(null);
    setError("");

    try {
      const blob = await upload(createAdminImageUploadPathname("homepage", file.name), file, {
        access: "public",
        contentType: file.type || undefined,
        handleUploadUrl: "/api/admin/product-images/upload",
        onUploadProgress: ({ percentage }) => {
          setUploadProgress(percentage);
        },
      });
      onChange(blob.url);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "";
      setError(message || "A képfeltöltés nem sikerült. A korábbi kép megmaradt.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-[#f0c0d8] bg-[#fff7fb] p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8f5367]">{label}</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#8f5367]">
          {value ? "Jelenlegi kép" : "Nincs kép feltöltve"}
        </span>
      </div>
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt={previewAlt} className="h-36 w-full rounded-md object-cover ring-1 ring-[#f0c0d8]" />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-[#e4c8d2] bg-white text-sm text-[#8f5367]">
          Nincs előnézeti kép
        </div>
      )}
      <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E0157A] bg-white px-4 text-sm font-semibold text-[#8b2859] hover:bg-[#fff0f7]">
        <ImageIcon className="h-4 w-4" />
        {isUploading ? "Feltöltés..." : value ? "Kép cseréje" : "Kép feltöltése"}
        <input type="file" accept={browserSafeProductImageAccept} onChange={handleFileChange} className="sr-only" />
      </label>
      {isUploading && uploadProgress !== null ? (
        <p className="text-xs font-medium text-[#6B3D52]">Feltöltés... {uploadProgress}%</p>
      ) : null}
      {error ? <p className="text-xs text-[#9f263f]">{error}</p> : null}
    </div>
  );
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function ProductSelectionField({
  title,
  emptyText,
  maxItems,
  products,
  selectedIds,
  onChange,
}: {
  title: string;
  emptyText: string;
  maxItems: number;
  products: AdminShowcaseProductOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedProducts = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is AdminShowcaseProductOption => Boolean(product));
  const normalizedQuery = query.trim().toLocaleLowerCase("hu");
  const matches = products
    .filter((product) => !selectedSet.has(product.id))
    .filter((product) => {
      if (!normalizedQuery) return true;
      return [product.name, product.categoryName]
        .join(" ")
        .toLocaleLowerCase("hu")
        .includes(normalizedQuery);
    })
    .slice(0, 10);

  function addProduct(productId: string) {
    if (selectedIds.includes(productId) || selectedIds.length >= maxItems) return;
    onChange([...selectedIds, productId]);
    setQuery("");
  }

  function removeProduct(productId: string) {
    onChange(selectedIds.filter((id) => id !== productId));
  }

  function moveProduct(index: number, direction: -1 | 1) {
    onChange(moveItem(selectedIds, index, index + direction));
  }

  return (
    <section className="space-y-3 rounded-lg border border-[#f0c0d8] bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#2D1A16]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[#8f5367]">
            {selectedProducts.length}/{maxItems} termék. Csak aktív, publikus termékek választhatók.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f5367]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Termék keresése név alapján"
          className="w-full rounded-md border border-[#e4c8d2] bg-white py-2 pl-9 pr-3 text-sm text-[#2D1A16] outline-none focus:border-[#E0157A] focus:ring-2 focus:ring-[#E0157A]/15"
          autoComplete="off"
        />
      </div>

      <div className="grid max-h-56 gap-1 overflow-y-auto overflow-x-hidden rounded-md border border-[#f0c0d8] bg-[#fffafc] p-1">
        {matches.length > 0 ? (
          matches.map((product) => {
            const displayUrl = getBrowserDisplayImageUrl(product.imageUrl);

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product.id)}
                disabled={selectedIds.length >= maxItems}
                className="grid w-full grid-cols-[36px_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-[#FDF0F6] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="h-9 w-9 overflow-hidden rounded border border-[#f0c0d8] bg-white">
                  {displayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block break-words text-sm font-medium leading-5 text-[#2D1A16]">{product.name}</span>
                  <span className="block break-words text-xs leading-4 text-[#8f5367]">
                    {product.categoryName} · {formatPrice(product.price)}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <span className="px-3 py-4 text-sm text-[#8f5367]">Nincs találat.</span>
        )}
      </div>

      <div className="grid gap-2">
        {selectedProducts.length > 0 ? (
          selectedProducts.map((product, index) => {
            const displayUrl = getBrowserDisplayImageUrl(product.imageUrl);

            return (
              <div
                key={product.id}
                className="grid w-full grid-cols-[20px_40px_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[#f0c0d8] bg-[#fff7fb] p-2"
              >
                <span className="w-5 shrink-0 text-center text-xs font-semibold text-[#8f5367]">{index + 1}</span>
                <span className="h-10 w-10 overflow-hidden rounded border border-[#f0c0d8] bg-white">
                  {displayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-semibold leading-5 text-[#2D1A16]">{product.name}</span>
                  <span className="block break-words text-xs leading-4 text-[#8f5367]">
                    {formatPrice(product.price)} · {product.categoryName}
                  </span>
                </span>
                <span className="flex flex-wrap justify-end gap-1">
                  <button type="button" onClick={() => moveProduct(index, -1)} disabled={index === 0} className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#e4c8d2] bg-white text-[#6B3D52] disabled:opacity-35" aria-label={`${product.name} feljebb mozgatása`}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveProduct(index, 1)} disabled={index === selectedProducts.length - 1} className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#e4c8d2] bg-white text-[#6B3D52] disabled:opacity-35" aria-label={`${product.name} lejjebb mozgatása`}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeProduct(product.id)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#e4c8d2] bg-white text-red-600" aria-label={`${product.name} eltávolítása`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-[#e4c8d2] bg-[#fffafc] px-3 py-4 text-sm leading-6 text-[#8f5367]">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}

function buildProductMaterialPicks(
  productIds: string[],
  products: AdminShowcaseProductOption[],
): HomepageMaterialPickView[] {
  const picks: HomepageMaterialPickView[] = [];

  productIds.forEach((id, index) => {
    const product = products.find((option) => option.id === id);
    if (!product) return;

    picks.push({
      id: `inline-product-${product.id}`,
      type: "PRODUCT",
      itemId: product.id,
      legacyItemId: null,
      isLegacySource: false,
      featuredProductId: product.id,
      storedFeaturedProductId: product.id,
      hasUnavailableFeaturedProduct: false,
      unavailableFeaturedProductReason: null,
      sortOrder: index + 1,
      title: product.categoryName,
      subtitle: product.name,
      href: `/product/${product.slug}`,
      imageUrl: getBrowserDisplayImageUrl(product.imageUrl),
      imageAlt: product.name,
      colorHex: null,
    });
  });

  return picks;
}

function EditableWrap({
  section,
  isEditing,
  onEdit,
  children,
}: {
  section: EditableSection;
  isEditing: boolean;
  onEdit: (section: EditableSection) => void;
  children: ReactNode;
}) {
  if (!isEditing) return <>{children}</>;

  return (
    <div
      className="relative outline outline-1 outline-offset-[-1px] outline-[#E0157A]/45"
      onClickCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a")) {
          event.preventDefault();
        }
      }}
    >
      <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-full bg-[#2D1A16]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
        {sectionLabels[section]}
      </div>
      <button
        type="button"
        onClick={() => onEdit(section)}
        className="absolute right-3 top-3 z-30 inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#8b2859] shadow-md ring-1 ring-[#f0c0d8] hover:bg-[#fff5fa]"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Szerkesztés
      </button>
      {children}
    </div>
  );
}

export function HomepageInlineEditor({
  initialContent,
  newsletterStatus,
  showcaseTabs,
  productOptions,
  initialFeaturedProductIds,
  initialMaterialProductIds,
}: HomepageInlineEditorProps) {
  const router = useRouter();
  const [savedContent, setSavedContent] = useState(() => cloneContent(initialContent));
  const [draft, setDraft] = useState(() => cloneContent(initialContent));
  const [savedFeaturedProductIds, setSavedFeaturedProductIds] = useState(initialFeaturedProductIds);
  const [draftFeaturedProductIds, setDraftFeaturedProductIds] = useState(initialFeaturedProductIds);
  const [savedMaterialProductIds, setSavedMaterialProductIds] = useState(initialMaterialProductIds);
  const [draftMaterialProductIds, setDraftMaterialProductIds] = useState(initialMaterialProductIds);
  const [featuredProductsDirty, setFeaturedProductsDirty] = useState(false);
  const [materialProductsDirty, setMaterialProductsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);
  const [activeSection, setActiveSection] = useState<EditableSection | null>(null);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isDraftVisible = isEditing || isPreviewingDraft;
  const visibleContent = isDraftVisible ? draft : savedContent;
  const currentFeaturedProductIds = isDraftVisible ? draftFeaturedProductIds : savedFeaturedProductIds;
  const currentMaterialProductIds = isDraftVisible ? draftMaterialProductIds : savedMaterialProductIds;
  const visibleMaterialPicks = useMemo(() => {
    if (currentMaterialProductIds.length === 0) return visibleContent.materialPicks;

    const productPicks = buildProductMaterialPicks(currentMaterialProductIds, productOptions);
    return productPicks.length > 0 ? productPicks : visibleContent.materialPicks;
  }, [currentMaterialProductIds, productOptions, visibleContent.materialPicks]);
  const visibleShowcaseTabs = useMemo(() => {
    if (currentFeaturedProductIds.length === 0) return showcaseTabs;

    const products = currentFeaturedProductIds
      .map((id) => productOptions.find((product) => product.id === id))
      .filter((product): product is AdminShowcaseProductOption => Boolean(product));

    if (products.length === 0) return showcaseTabs;

    return [
      {
        key: "inline-featured-preview",
        label: "Kiemelt",
        products,
      },
      ...showcaseTabs.filter((tab) => tab.key !== "inline-featured"),
    ];
  }, [currentFeaturedProductIds, productOptions, showcaseTabs]);

  const inlinePayload = useMemo(
    () => ({
      hero: draft.hero,
      heroFeatureBar: draft.heroFeatureBar,
      categoryGrid: draft.categoryGrid,
      featuredSlider: draft.featuredSlider,
      instagram: draft.instagram,
      newsletter: draft.newsletter,
      promoTiles: draft.promoTiles,
      ...(featuredProductsDirty ? { featuredProductIds: draftFeaturedProductIds } : {}),
      ...(materialProductsDirty ? { materialProductIds: draftMaterialProductIds } : {}),
    }),
    [draft, draftFeaturedProductIds, draftMaterialProductIds, featuredProductsDirty, materialProductsDirty],
  );

  function updateBlock(key: keyof Pick<HomepageContentView, "hero" | "heroFeatureBar" | "categoryGrid" | "featuredSlider" | "instagram" | "newsletter">, patch: Partial<HomepageBlockView>) {
    setDraft((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }

  function updateBlockMetadata(key: keyof Pick<HomepageContentView, "hero" | "heroFeatureBar" | "categoryGrid" | "featuredSlider" | "instagram" | "newsletter">, metadata: Record<string, unknown>) {
    setDraft((current) => ({
      ...current,
      [key]: { ...current[key], metadata: { ...current[key].metadata, ...metadata } },
    }));
  }

  function updateTile(slotIndex: number, patch: Partial<HomepagePromoTileView>) {
    setDraft((current) => ({
      ...current,
      promoTiles: current.promoTiles.map((tile) =>
        tile.slotIndex === slotIndex ? { ...tile, ...patch } : tile,
      ),
    }));
  }

  async function handleSave() {
    if (isSaving) return;

    setIsSaving(true);
    setStatus("Mentés folyamatban...");
    const result = await updateHomepageContentAction(inlinePayload);
    setIsSaving(false);
    setStatus(result.ok ? "Mentve" : result.message || "A mentés nem sikerült.");
    if (result.ok) {
      setSavedContent(cloneContent(draft));
      setSavedFeaturedProductIds(draftFeaturedProductIds);
      setSavedMaterialProductIds(draftMaterialProductIds);
      setFeaturedProductsDirty(false);
      setMaterialProductsDirty(false);
      setIsPreviewingDraft(false);
      router.refresh();
    }
  }

  function handleCancel() {
    setDraft(cloneContent(savedContent));
    setDraftFeaturedProductIds(savedFeaturedProductIds);
    setDraftMaterialProductIds(savedMaterialProductIds);
    setFeaturedProductsDirty(false);
    setMaterialProductsDirty(false);
    setIsEditing(false);
    setIsPreviewingDraft(false);
    setActiveSection(null);
    setStatus("");
  }

  function handlePreview() {
    setIsEditing(false);
    setIsPreviewingDraft(true);
    setActiveSection(null);
  }

  function resumeEditing() {
    setIsEditing(true);
    setIsPreviewingDraft(false);
    setActiveSection(activeSection ?? "hero");
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <EditableWrap section="hero" isEditing={isEditing} onEdit={setActiveSection}>
        <HeroBanner block={visibleContent.hero} featureBlock={visibleContent.heroFeatureBar} />
      </EditableWrap>
      <EditableWrap section="categoryGrid" isEditing={isEditing} onEdit={setActiveSection}>
        <HomePromoTileGrid
          tiles={visibleContent.promoTiles}
          materialPicks={visibleMaterialPicks}
          categoryBlock={visibleContent.categoryGrid}
        />
      </EditableWrap>
      {visibleShowcaseTabs.length > 0 ? (
        <EditableWrap section="featuredSlider" isEditing={isEditing} onEdit={setActiveSection}>
          <FeaturedSlider tabs={visibleShowcaseTabs} contentBlock={visibleContent.featuredSlider} />
        </EditableWrap>
      ) : null}
      <HomeEditorialSection />
      <EditableWrap section="social" isEditing={isEditing} onEdit={setActiveSection}>
        <HomeInstagramPromo block={visibleContent.instagram} />
      </EditableWrap>
      <EditableWrap section="newsletter" isEditing={isEditing} onEdit={setActiveSection}>
        <HomeNewsletterBlock contentBlock={visibleContent.newsletter} status={newsletterStatus} />
      </EditableWrap>
      <HomeFinalCta />

      <div className="fixed bottom-5 right-5 z-50 flex flex-wrap justify-end gap-2 rounded-full border border-[#f0c0d8] bg-white/94 p-2 shadow-[0_12px_36px_rgba(45,26,22,0.18)] backdrop-blur">
        {!isEditing && !isPreviewingDraft ? (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setActiveSection("hero");
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2D1A16] px-4 text-sm font-semibold text-white"
          >
            <Edit3 className="h-4 w-4" />
            Főoldal szerkesztése
          </button>
        ) : (
          <>
            <button type="button" onClick={isPreviewingDraft ? resumeEditing : handlePreview} className="rounded-full px-4 text-sm font-semibold text-[#6B3D52] hover:bg-[#FDF0F6]">
              {isPreviewingDraft ? "Szerkesztés" : "Előnézet"}
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#E0157A] px-4 text-sm font-semibold text-white disabled:opacity-60">
              <Save className="h-4 w-4" />
              {isSaving ? "Mentés folyamatban..." : "Mentés"}
            </button>
            <button type="button" onClick={handleCancel} className="rounded-full px-4 text-sm font-semibold text-[#6B3D52] hover:bg-[#FDF0F6]">
              Mégse
            </button>
          </>
        )}
      </div>

      {status ? (
        <div className="fixed bottom-20 right-5 z-50 rounded-full bg-[#2D1A16] px-4 py-2 text-sm font-medium text-white shadow-lg">
          {status}
        </div>
      ) : null}

      {activeSection && isEditing ? (
        <EditDrawer
          section={activeSection}
          draft={draft}
          onClose={() => setActiveSection(null)}
          onSectionChange={setActiveSection}
          updateBlock={updateBlock}
          updateBlockMetadata={updateBlockMetadata}
          updateTile={updateTile}
          productOptions={productOptions}
          featuredProductIds={draftFeaturedProductIds}
          materialProductIds={draftMaterialProductIds}
          onFeaturedProductIdsChange={(ids) => {
            setDraftFeaturedProductIds(ids);
            setFeaturedProductsDirty(true);
          }}
          onMaterialProductIdsChange={(ids) => {
            setDraftMaterialProductIds(ids);
            setMaterialProductsDirty(true);
          }}
          onPreview={handlePreview}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
          status={status}
        />
      ) : null}
    </main>
  );
}

function EditDrawer({
  section,
  draft,
  onClose,
  onSectionChange,
  updateBlock,
  updateBlockMetadata,
  updateTile,
  productOptions,
  featuredProductIds,
  materialProductIds,
  onFeaturedProductIdsChange,
  onMaterialProductIdsChange,
  onPreview,
  onSave,
  onCancel,
  isSaving,
  status,
}: {
  section: EditableSection;
  draft: HomepageContentView;
  onClose: () => void;
  onSectionChange: (section: EditableSection) => void;
  updateBlock: (key: "hero" | "heroFeatureBar" | "categoryGrid" | "featuredSlider" | "instagram" | "newsletter", patch: Partial<HomepageBlockView>) => void;
  updateBlockMetadata: (key: "hero" | "heroFeatureBar" | "categoryGrid" | "featuredSlider" | "instagram" | "newsletter", metadata: Record<string, unknown>) => void;
  updateTile: (slotIndex: number, patch: Partial<HomepagePromoTileView>) => void;
  productOptions: AdminShowcaseProductOption[];
  featuredProductIds: string[];
  materialProductIds: string[];
  onFeaturedProductIdsChange: (ids: string[]) => void;
  onMaterialProductIdsChange: (ids: string[]) => void;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  status: string;
}) {
  const features = getFeatures(draft.heroFeatureBar);
  const perks = getPerks(draft.newsletter);
  const teamMembers = getTeamMembers(draft.instagram);

  return (
    <aside className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[440px] min-w-0 flex-col overflow-hidden border-l border-[#f0c0d8] bg-[#fffafc] shadow-[-18px_0_44px_rgba(45,26,22,0.18)]">
      <div className="shrink-0 border-b border-[#f0c0d8] bg-[#fffafc]/95 px-4 pb-4 pt-5 backdrop-blur sm:px-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f5367]">Inline edit</p>
            <h2 className="mt-1 font-[family:var(--font-display)] text-3xl text-[#2D1A16]">{sectionLabels[section]}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#6B3D52] hover:bg-[#FDF0F6]" aria-label="Bezárás">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Homepage editor blokkok">
          {editableSections.map((editableSection) => {
            const isActive = editableSection === section;

            return (
              <button
                key={editableSection}
                type="button"
                onClick={() => onSectionChange(editableSection)}
                className={[
                  "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  isActive
                    ? "border-[#E0157A] bg-[#E0157A] text-white shadow-[0_8px_20px_rgba(224,21,122,0.22)]"
                    : "border-[#f0c0d8] bg-white text-[#8b2859] hover:border-[#E0157A] hover:bg-[#fff5fa]",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {sectionLabels[editableSection]}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-5 pb-28 sm:px-5">
        {section === "hero" ? (
          <>
            <ImageField label="Hero kép" value={draft.hero.imageUrl} previewAlt={draft.hero.imageAlt || draft.hero.title} onChange={(value) => updateBlock("hero", { imageUrl: value })} />
            <TextField label="Eyebrow" value={draft.hero.eyebrow} onChange={(value) => updateBlock("hero", { eyebrow: value })} />
            <TextField label="Headline" value={draft.hero.title} onChange={(value) => updateBlock("hero", { title: value })} multiline />
            <TextField label="Subtitle" value={draft.hero.body} onChange={(value) => updateBlock("hero", { body: value })} multiline />
            <TextField label="Hero kép alt" value={draft.hero.imageAlt} onChange={(value) => updateBlock("hero", { imageAlt: value })} />
            <TextField label="Primary CTA label" value={draft.hero.buttonText} onChange={(value) => updateBlock("hero", { buttonText: value })} />
            <TextField label="Primary CTA href" value={draft.hero.buttonHref} onChange={(value) => updateBlock("hero", { buttonHref: value })} />
            <TextField label="Secondary CTA label" value={getMetadataString(draft.hero, "secondaryButtonText")} onChange={(value) => updateBlockMetadata("hero", { secondaryButtonText: value })} />
            <TextField label="Secondary CTA href" value={getMetadataString(draft.hero, "secondaryButtonHref")} onChange={(value) => updateBlockMetadata("hero", { secondaryButtonHref: value })} />
          </>
        ) : null}

        {section === "featureBar"
          ? features.map((feature, index) => (
              <div key={index} className="rounded-lg border border-[#f0c0d8] bg-white p-3">
                <TextField label={`Feature ${index + 1} label`} value={feature.label} onChange={(value) => {
                  const next = [...features];
                  next[index] = { ...feature, label: value };
                  updateBlockMetadata("heroFeatureBar", { features: next });
                }} />
                <TextField label={`Feature ${index + 1} text`} value={feature.text} onChange={(value) => {
                  const next = [...features];
                  next[index] = { ...feature, text: value };
                  updateBlockMetadata("heroFeatureBar", { features: next });
                }} multiline />
              </div>
            ))
          : null}

        {section === "categoryGrid" ? (
          <>
            <TextField label="Section eyebrow" value={draft.categoryGrid.eyebrow} onChange={(value) => updateBlock("categoryGrid", { eyebrow: value })} />
            <TextField label="Headline" value={draft.categoryGrid.title} onChange={(value) => updateBlock("categoryGrid", { title: value })} multiline />
            <TextField label="Description" value={draft.categoryGrid.body} onChange={(value) => updateBlock("categoryGrid", { body: value })} multiline />
            <div className="space-y-3 rounded-lg border border-[#f0c0d8] bg-white p-3">
              <p className="text-sm font-semibold text-[#2D1A16]">Kurált fókusz</p>
              <TextField label="Material eyebrow" value={getMetadataString(draft.categoryGrid, "materialEyebrow")} onChange={(value) => updateBlockMetadata("categoryGrid", { materialEyebrow: value })} />
              <TextField label="Material headline" value={getMetadataString(draft.categoryGrid, "materialTitle")} onChange={(value) => updateBlockMetadata("categoryGrid", { materialTitle: value })} />
              <TextField label="Material description" value={getMetadataString(draft.categoryGrid, "materialBody")} onChange={(value) => updateBlockMetadata("categoryGrid", { materialBody: value })} multiline />
            </div>
            <ProductSelectionField
              title="Kő fókusz termékei"
              emptyText="Nincs kézi termék kiválasztva. Mentéskor üres kézi lista esetén a meglévő fallback viselkedés marad."
              maxItems={5}
              products={productOptions}
              selectedIds={materialProductIds}
              onChange={onMaterialProductIdsChange}
            />
            {draft.promoTiles.map((tile) => (
              <div key={tile.slotIndex} className="space-y-3 rounded-lg border border-[#f0c0d8] bg-white p-3">
                <p className="text-sm font-semibold text-[#2D1A16]">Csempe {tile.slotIndex}</p>
                <ImageField label={`Csempe ${tile.slotIndex} kép`} value={tile.imageUrl} previewAlt={tile.imageAlt || tile.title} onChange={(value) => updateTile(tile.slotIndex, { imageUrl: value })} />
                <TextField label="Title" value={tile.title} onChange={(value) => updateTile(tile.slotIndex, { title: value })} />
                <TextField label="Subtitle" value={tile.subtitle} onChange={(value) => updateTile(tile.slotIndex, { subtitle: value })} multiline />
                <TextField label="Href" value={tile.href} onChange={(value) => updateTile(tile.slotIndex, { href: value })} />
                <TextField label="Image alt" value={tile.imageAlt} onChange={(value) => updateTile(tile.slotIndex, { imageAlt: value })} />
                <ToggleField label="Új badge" checked={tile.isNew} onChange={(value) => updateTile(tile.slotIndex, { isNew: value })} />
              </div>
            ))}
          </>
        ) : null}

        {section === "featuredSlider" ? (
          <>
            <TextField label="Section eyebrow" value={draft.featuredSlider.eyebrow} onChange={(value) => updateBlock("featuredSlider", { eyebrow: value })} />
            <TextField label="Headline" value={draft.featuredSlider.title} onChange={(value) => updateBlock("featuredSlider", { title: value })} />
            <TextField label="Description" value={draft.featuredSlider.body} onChange={(value) => updateBlock("featuredSlider", { body: value })} multiline />
            <ProductSelectionField
              title="Kiemelt termékek"
              emptyText="Nincs kézi termék kiválasztva. Ilyenkor a meglévő showcase tabok automatikus/fallback terméklistája jelenik meg."
              maxItems={12}
              products={productOptions}
              selectedIds={featuredProductIds}
              onChange={onFeaturedProductIdsChange}
            />
          </>
        ) : null}

        {section === "social" ? (
          <>
            <ImageField label="Instagram kép" value={draft.instagram.imageUrl} previewAlt={draft.instagram.imageAlt || draft.instagram.title} onChange={(value) => updateBlock("instagram", { imageUrl: value })} />
            <TextField label="Instagram eyebrow" value={draft.instagram.eyebrow} onChange={(value) => updateBlock("instagram", { eyebrow: value })} />
            <TextField label="Instagram title" value={draft.instagram.title} onChange={(value) => updateBlock("instagram", { title: value })} />
            <TextField label="Instagram text" value={draft.instagram.body} onChange={(value) => updateBlock("instagram", { body: value })} multiline />
            <TextField label="Instagram CTA label" value={draft.instagram.buttonText} onChange={(value) => updateBlock("instagram", { buttonText: value })} />
            <TextField label="Instagram CTA href" value={draft.instagram.buttonHref} onChange={(value) => updateBlock("instagram", { buttonHref: value })} />
            <TextField label="Instagram kép alt" value={draft.instagram.imageAlt} onChange={(value) => updateBlock("instagram", { imageAlt: value })} />
            <ImageField label="Facebook kép" value={getMetadataString(draft.instagram, "facebookImageUrl")} previewAlt="Facebook" onChange={(value) => updateBlockMetadata("instagram", { facebookImageUrl: value })} />
            <TextField label="Facebook text" value={getMetadataString(draft.instagram, "facebookBody")} onChange={(value) => updateBlockMetadata("instagram", { facebookBody: value })} multiline />
            <TextField label="Facebook CTA href" value={getMetadataString(draft.instagram, "facebookHref")} onChange={(value) => updateBlockMetadata("instagram", { facebookHref: value })} />
            {teamMembers.map((member, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-[#f0c0d8] bg-white p-3">
                <p className="text-sm font-semibold text-[#2D1A16]">Csapattag {index + 1}</p>
                <ImageField label={`Csapattag ${index + 1} kép`} value={member.imageUrl} previewAlt={member.name} onChange={(value) => {
                  const next = [...teamMembers];
                  next[index] = { ...member, imageUrl: value };
                  updateBlockMetadata("instagram", { teamMembers: next });
                }} />
                <TextField label="Név" value={member.name} onChange={(value) => {
                  const next = [...teamMembers];
                  next[index] = { ...member, name: value };
                  updateBlockMetadata("instagram", { teamMembers: next });
                }} />
                <TextField label="Szerep" value={member.role} onChange={(value) => {
                  const next = [...teamMembers];
                  next[index] = { ...member, role: value };
                  updateBlockMetadata("instagram", { teamMembers: next });
                }} />
              </div>
            ))}
          </>
        ) : null}

        {section === "newsletter" ? (
          <>
            <TextField label="Eyebrow" value={draft.newsletter.eyebrow} onChange={(value) => updateBlock("newsletter", { eyebrow: value })} />
            <TextField label="Headline" value={draft.newsletter.title} onChange={(value) => updateBlock("newsletter", { title: value })} multiline />
            <TextField label="Subtitle" value={draft.newsletter.body} onChange={(value) => updateBlock("newsletter", { body: value })} multiline />
            {perks.map((perk, index) => (
              <TextField key={index} label={`Perk ${index + 1}`} value={perk} onChange={(value) => {
                const next = [...perks];
                next[index] = value;
                updateBlockMetadata("newsletter", { perks: next });
              }} />
            ))}
            <TextField label="Note text" value={getMetadataString(draft.newsletter, "note")} onChange={(value) => updateBlockMetadata("newsletter", { note: value })} multiline />
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 shrink-0 border-t border-[#f0c0d8] bg-white/96 px-4 py-3 shadow-[0_-10px_28px_rgba(45,26,22,0.08)] backdrop-blur sm:px-5">
        {status ? (
          <p className="mb-2 text-xs font-medium text-[#6B3D52]" aria-live="polite">
            {status}
          </p>
        ) : null}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="min-h-10 rounded-full border border-[#e4c8d2] bg-white px-3 text-sm font-semibold text-[#6B3D52] hover:bg-[#FDF0F6]"
          >
            Előnézet
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#E0157A] px-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Mentés..." : "Mentés"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 rounded-full border border-transparent px-3 text-sm font-semibold text-[#6B3D52] hover:bg-[#FDF0F6]"
          >
            Mégse
          </button>
        </div>
      </div>
    </aside>
  );
}
