import {
  deleteProductAction,
  toggleProductArchiveAction,
  toggleProductFlagAction,
} from "@/app/(admin)/admin/products/actions";
import {
  AdminActionButton,
  AdminActionLink,
} from "@/components/admin/AdminActionButton";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice, homepagePlacementLabels } from "@/lib/catalog";
import { getProductAvailabilitySnapshot } from "@/lib/product-lifecycle";
import { getAdminProducts, getProductOptionGroups } from "@/lib/products";

export default async function AdminProductsPage() {
  const [products, optionGroups] = await Promise.all([
    getAdminProducts(),
    getProductOptionGroups(true),
  ]);

  return (
    <AdminShell
      title="Termékek"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <OptionSummary groups={optionGroups} />
        <AdminActionLink href="/admin/products/new" variant="primary">
          Új termék
        </AdminActionLink>
      </div>

      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <article key={product.id} className="admin-panel-soft p-4">
            {(() => {
              const snapshot = getProductAvailabilitySnapshot(product);
              const statusLabel =
                snapshot.lifecycleStatus === "active"
                  ? "Aktív"
                  : snapshot.lifecycleStatus === "draft"
                    ? "Draft"
                  : snapshot.lifecycleStatus === "sold_out"
                    ? "Elfogyott"
                    : "Hiányos";

              return (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="admin-badge-neutral admin-pill">{statusLabel}</span>
                  <span className="text-xs text-[var(--admin-ink-500)]">
                    Készlet: {product.stockQuantity} db
                  </span>
                  {snapshot.readinessIssues.length > 0 ? (
                    <span className="text-xs text-[#9b476f]">
                      {snapshot.readinessIssues[0]?.message}
                    </span>
                  ) : null}
                </div>
              );
            })()}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug text-[var(--admin-ink-900)]">
                  {product.name}
                </p>
                <p className="mt-1 break-all text-sm text-[var(--admin-ink-600)]">/{product.slug}</p>
              </div>
              <p className="shrink-0 text-right text-sm font-semibold text-[var(--admin-ink-900)]">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-[var(--admin-ink-700)]">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--admin-ink-500)]">Kategória</span>
                <span className="font-medium text-[var(--admin-ink-900)]">{product.category.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--admin-ink-500)]">Kihelyezés</span>
                <span className="text-right font-medium text-[var(--admin-ink-900)]">
                  {
                    homepagePlacementLabels[
                      product.homepagePlacement.toLowerCase() as keyof typeof homepagePlacementLabels
                    ]
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--admin-line-100)] pt-4">
              <p className="mb-2 text-xs font-medium text-[var(--admin-ink-500)]">Jelölések</p>
              <div className="flex flex-wrap gap-2">
                <ProductFlagToggle productId={product.id} flag="isNew" active={product.isNew} label="Új" />
                <ProductFlagToggle
                  productId={product.id}
                  flag="isGiftable"
                  active={product.isGiftable}
                  label="Ajándékozható"
                />
                <ProductFlagToggle productId={product.id} flag="isOnSale" active={product.isOnSale} label="Akciós" />
                <ProductArchiveToggle productId={product.id} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--admin-line-100)] pt-4">
              <AdminActionLink href={`/admin/products/${product.id}/edit`} size="sm" className="!h-9 !px-3 !text-xs">
                Szerkesztés
              </AdminActionLink>
              <form action={deleteProductAction}>
                <input type="hidden" name="productId" value={product.id} />
                <AdminActionButton type="submit" variant="danger" size="sm" className="!h-9 !px-3 !text-xs">
                  Törlés
                </AdminActionButton>
              </form>
            </div>
          </article>
        ))}
      </div>

      <div className="admin-table-shell hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="admin-table-head text-[10px] uppercase tracking-[0.28em] text-[var(--admin-ink-500)]">
              <tr>
                <th className="px-5 py-4">Termék</th>
                <th className="px-5 py-4">Kategória</th>
                <th className="px-5 py-4">Ár</th>
                <th className="px-5 py-4">Állapot</th>
                <th className="px-5 py-4">Kihelyezés</th>
                <th className="px-5 py-4">Jelölések</th>
                <th className="px-5 py-4">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const snapshot = getProductAvailabilitySnapshot(product);
                const statusLabel =
                  snapshot.lifecycleStatus === "active"
                    ? "Aktív"
                    : snapshot.lifecycleStatus === "draft"
                      ? "Draft"
                    : snapshot.lifecycleStatus === "sold_out"
                      ? "Elfogyott"
                      : "Hiányos";

                return (
                <tr key={product.id} className="admin-table-row last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--admin-ink-900)]">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--admin-ink-600)]">/{product.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    {product.category.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[var(--admin-ink-900)]">{statusLabel}</span>
                      <span className="text-xs text-[var(--admin-ink-500)]">
                        {product.stockQuantity} db készlet
                      </span>
                      {snapshot.readinessIssues.length > 0 ? (
                        <span className="text-xs text-[#9b476f]">
                          {snapshot.readinessIssues[0]?.message}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                    {
                      homepagePlacementLabels[
                        product.homepagePlacement.toLowerCase() as keyof typeof homepagePlacementLabels
                      ]
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ProductFlagToggle
                        productId={product.id}
                        flag="isNew"
                        active={product.isNew}
                        label="Új"
                      />
                      <ProductFlagToggle
                        productId={product.id}
                        flag="isGiftable"
                        active={product.isGiftable}
                        label="Ajándékozható"
                      />
                      <ProductFlagToggle
                        productId={product.id}
                        flag="isOnSale"
                        active={product.isOnSale}
                        label="Akciós"
                      />
                      <ProductArchiveToggle productId={product.id} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <AdminActionLink
                        href={`/admin/products/${product.id}/edit`}
                        size="sm"
                        className="!h-8 !px-3 !text-xs"
                      >
                        Szerkesztés
                      </AdminActionLink>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <AdminActionButton type="submit" variant="danger" size="sm" className="!h-8 !px-3 !text-xs">
                          Törlés
                        </AdminActionButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function OptionSummary({
  groups,
}: {
  groups: Awaited<ReturnType<typeof getProductOptionGroups>>;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-[var(--admin-ink-600)]">
      {groups.map((group) => {
        const activeCount = group.options.filter((option) => option.isActive).length;
        const navCount =
          group.type === "CATEGORY"
            ? group.options.filter(
                (option) =>
                  option.isActive &&
                  option.isStorefrontVisible &&
                  option.showInMainNav,
              ).length
            : null;

        return (
          <span key={group.type} className="admin-badge-neutral admin-pill">
            {group.label}: {activeCount}
            {navCount !== null ? ` / főmenü: ${navCount}` : ""}
          </span>
        );
      })}
    </div>
  );
}

function ProductFlagToggle({
  productId,
  flag,
  active,
  label,
}: {
  productId: string;
  flag: "isNew" | "isGiftable" | "isOnSale";
  active: boolean;
  label: string;
}) {
  return (
    <form action={toggleProductFlagAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="nextValue" value={String(!active)} />
      <AdminActionButton
        type="submit"
        size="sm"
        variant={active ? "primary" : "secondary"}
        className="!h-8 !px-3 !text-xs"
      >
        {label}
      </AdminActionButton>
    </form>
  );
}

function ProductArchiveToggle({ productId }: { productId: string }) {
  return (
    <form action={toggleProductArchiveAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="nextArchived" value="true" />
      <input type="hidden" name="archiveReason" value="DISCONTINUED" />
      <AdminActionButton
        type="submit"
        size="sm"
        variant="danger"
        className="!h-8 !px-3 !text-xs"
      >
        Archiválás
      </AdminActionButton>
    </form>
  );
}
