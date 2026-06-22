import Link from "next/link";
import { BlobCleanupStatus, ProductStatus } from "@prisma/client";

import { AdminRecentActivityList } from "@/components/admin/AdminRecentActivityList";
import { AdminShell } from "@/components/admin/AdminShell";
import { getRecentAdminActivity } from "@/lib/admin-activity";
import { db } from "@/lib/db";
import { getHomepageContent } from "@/lib/homepage-content";
import { getAdminShowcaseTabs } from "@/lib/homepage-showcase";
import { storefrontProductWhere } from "@/lib/product-lifecycle";
import { formatPrice } from "@/lib/catalog";
import { getShowcaseTabProducts } from "@/lib/products-server";

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  received:      { label: "Beérkezett",   bg: "#f0f0f0", color: "#555", border: "#ddd" },
  in_production: { label: "Elkészítés",   bg: "#fef9e7", color: "#7d6608", border: "#f0d080" },
  packed:        { label: "Becsomagolva", bg: "#eaf4fb", color: "#1a5276", border: "#a9cce3" },
  label_ready:   { label: "Címke kész",   bg: "#e8f8f5", color: "#1e8449", border: "#a9dfbf" },
  shipped:       { label: "Feladva",      bg: "#eafaf1", color: "#145a32", border: "#82e0aa" },
  closed:        { label: "Lezárva",      bg: "#f2f3f4", color: "#333",   border: "#ccc" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.received;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

type OrderWithInternalStatus = any;

type HealthTone = "good" | "warn" | "danger" | "neutral";

type DashboardHealthCard = {
  title: string;
  value: string;
  tone: HealthTone;
  description: string;
  href?: string;
  linkLabel?: string;
  details: string[];
};

const healthToneClass: Record<HealthTone, string> = {
  good: "border-[#bdd7c8] bg-[#f6fbf7] text-[#24533a]",
  warn: "border-[#ead6a7] bg-[#fff9e8] text-[#765b18]",
  danger: "border-[#e3c7cf] bg-[#fff1f3] text-[#99283d]",
  neutral: "border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-700)]",
};

function HealthCard({ card }: { card: DashboardHealthCard }) {
  return (
    <section className="admin-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="admin-eyebrow">{card.title}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{card.value}</p>
        </div>
        <span className={`rounded-sm border px-2.5 py-1 text-xs font-medium ${healthToneClass[card.tone]}`}>
          {card.tone === "good" ? "OK" : card.tone === "danger" ? "Figyelem" : card.tone === "warn" ? "Ellenőrizd" : "Info"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--admin-ink-600)]">{card.description}</p>
      {card.details.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm text-[var(--admin-ink-700)]">
          {card.details.map((detail) => (
            <li key={detail} className="flex gap-2">
              <span aria-hidden="true">-</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {card.href ? (
        <Link href={card.href} className="admin-inline-link mt-4 inline-flex text-sm font-medium">
          {card.linkLabel ?? "Megnyitás"} →
        </Link>
      ) : (
        <p className="mt-4 text-xs text-[var(--admin-ink-500)]">Dedikált admin oldal Phase 3.2-ben.</p>
      )}
    </section>
  );
}

async function getEmptyShowcaseTabCount() {
  const tabs = await getAdminShowcaseTabs();
  const activeTabs = tabs.filter((tab) => tab.isActive);
  const productCounts = await Promise.all(
    activeTabs.map(async (tab) => {
      const products = await getShowcaseTabProducts(tab.filterType, tab.filterValue, tab.maxItems);
      return products.length;
    }),
  );

  return productCounts.filter((count) => count === 0).length;
}

export default async function AdminPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const promoExpiryThreshold = new Date(now);
  promoExpiryThreshold.setDate(promoExpiryThreshold.getDate() + 7);

  const [
    productCount,
    todayOrderCount,
    weekOrders,
    pendingOrderCount,
    recentOrders,
    recentActivity,
    lowStockCount,
    outOfStockCount,
    openReturnCount,
    failedRefundCount,
    homepageContent,
    emptyShowcaseTabCount,
    pendingCleanupCount,
    failedCleanupCount,
    keptCleanupCount,
    expiringPromoCount,
    limitedPromoCodes,
  ] = await Promise.all([
    db.product.count({ where: storefrontProductWhere }),
    db.order.count({
      where: { paymentStatus: "PAID", createdAt: { gte: todayStart } },
    }),
    db.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: weekStart } },
      select: { total: true },
    }),
    db.order.count({
      where: { paymentStatus: "PAID", internalStatus: { in: ["received", "in_production", "packed", "label_ready"] } } as any,
    }),
    db.order.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    getRecentAdminActivity(8),
    db.product.count({
      where: { status: ProductStatus.ACTIVE, archivedAt: null, stockQuantity: { lte: 3 } },
    }),
    db.product.count({
      where: { status: ProductStatus.ACTIVE, archivedAt: null, stockQuantity: { lte: 0 } },
    }),
    db.returnRequest.count({
      where: { status: { in: ["new", "in_review", "approved"] } },
    }),
    db.returnRequest.count({
      where: { refundStatus: "failed" },
    }),
    getHomepageContent(),
    getEmptyShowcaseTabCount(),
    db.blobCleanupQueueItem.count({ where: { status: BlobCleanupStatus.PENDING } }),
    db.blobCleanupQueueItem.count({ where: { status: BlobCleanupStatus.FAILED } }),
    db.blobCleanupQueueItem.count({ where: { status: BlobCleanupStatus.KEPT } }),
    db.promoCode.count({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now, lte: promoExpiryThreshold },
      },
    }),
    db.promoCode.findMany({
      where: { isActive: true, totalUsageLimit: { not: null } },
      select: { id: true, redeemedCount: true, totalUsageLimit: true },
    }),
  ]);

  const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
  const promoNearLimitCount = limitedPromoCodes.filter((promo) => {
    if (!promo.totalUsageLimit || promo.totalUsageLimit <= 0) return false;
    return promo.redeemedCount / promo.totalUsageLimit >= 0.8;
  }).length;
  const homepageIssues = [
    !homepageContent.hero.imageUrl ? "Hiányzik a hero kép" : null,
    !homepageContent.hero.isVisible ? "A hero blokk rejtett" : null,
    !homepageContent.instagram.isVisible ? "Az Instagram blokk rejtett" : null,
    emptyShowcaseTabCount > 0 ? `${emptyShowcaseTabCount} aktív showcase tab üres` : null,
    homepageContent.materialPicks.filter((pick) => pick.hasUnavailableFeaturedProduct).length > 0
      ? `${homepageContent.materialPicks.filter((pick) => pick.hasUnavailableFeaturedProduct).length} material pick nem elérhető termékre mutat`
      : null,
    homepageContent.promoTiles.filter((tile) => tile.isVisible && (!tile.imageUrl || !tile.href)).length > 0
      ? `${homepageContent.promoTiles.filter((tile) => tile.isVisible && (!tile.imageUrl || !tile.href)).length} látható promó csempén hiányzik kép vagy link`
      : null,
  ].filter((issue): issue is string => Boolean(issue));
  const healthCards: DashboardHealthCard[] = [
    {
      title: "Low stock",
      value: `${lowStockCount} termék`,
      tone: outOfStockCount > 0 ? "danger" : lowStockCount > 0 ? "warn" : "good",
      description: "Aktív, nem archivált termékek 3 db vagy alacsonyabb készlettel.",
      href: "/admin/products",
      linkLabel: "Termékek",
      details: [
        `${lowStockCount} aktív termék stock <= 3`,
        `${outOfStockCount} aktív termék stock <= 0`,
      ],
    },
    {
      title: "Returns needing action",
      value: `${openReturnCount + failedRefundCount} ügy`,
      tone: failedRefundCount > 0 ? "danger" : openReturnCount > 0 ? "warn" : "good",
      description: "Nyitott visszaküldések és sikertelen refundok.",
      href: "/admin/returns",
      linkLabel: "Visszaküldések",
      details: [
        `${openReturnCount} nyitott vagy feldolgozás alatt álló request`,
        `${failedRefundCount} sikertelen refund`,
      ],
    },
    {
      title: "Homepage health",
      value: homepageIssues.length === 0 ? "OK" : `${homepageIssues.length} jelzés`,
      tone: homepageIssues.length > 0 ? "warn" : "good",
      description: "Kezdőlapi blokkok, showcase tabok, material pickek és promó csempék gyors ellenőrzése.",
      href: homepageIssues.some((issue) => issue.includes("showcase")) ? "/admin/content/homepage-showcase" : "/admin/content/homepage",
      linkLabel: "Kezdőlap tartalom",
      details: homepageIssues.length > 0 ? homepageIssues : ["Nincs látható kezdőlapi tartalomhiba."],
    },
    {
      title: "Media cleanup",
      value: `${pendingCleanupCount + failedCleanupCount} aktív`,
      tone: failedCleanupCount > 0 ? "danger" : pendingCleanupCount > 0 ? "neutral" : "good",
      description: "Vercel Blob cleanup queue és média inventory állapot.",
      href: "/admin/media",
      linkLabel: "Média",
      details: [
        `${pendingCleanupCount} pending cleanup item`,
        `${failedCleanupCount} failed cleanup item`,
        `${keptCleanupCount} kept/skipped item`,
      ],
    },
    {
      title: "Promo health",
      value: `${expiringPromoCount + promoNearLimitCount} jelzés`,
      tone: expiringPromoCount + promoNearLimitCount > 0 ? "warn" : "good",
      description: "Aktív kuponok lejárata és usage limit telítettsége.",
      href: "/admin/promo-codes",
      linkLabel: "Kuponkódok",
      details: [
        `${expiringPromoCount} aktív promo code 7 napon belül lejár`,
        `${promoNearLimitCount} aktív promo code legalább 80%-os usage limitnél jár`,
      ],
    },
  ];

  const metrics = [
    { label: "Aktív termékek",    value: productCount,              delta: null },
    { label: "Mai rendelések",    value: todayOrderCount,           delta: todayOrderCount > 0 ? `+${todayOrderCount} ma` : null },
    { label: "Heti bevétel",      value: formatPrice(weekRevenue),  delta: null },
    { label: "Feldolgozás alatt", value: pendingOrderCount,         delta: null },
  ];

  return (
    <AdminShell
      title="Dashboard"
      description={now.toLocaleDateString("hu-HU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      actions={
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="admin-button-primary h-9 px-4 text-sm"
          >
            + Új termék
          </Link>
          <Link
            href="/admin/orders"
            className="admin-button-secondary h-9 px-4 text-sm"
          >
            Rendelések
          </Link>
        </div>
      }
    >
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="admin-panel p-5">
            <p className="mb-2 text-[11px] uppercase tracking-[.18em] text-[var(--admin-ink-500)]">{m.label}</p>
            <p className="text-2xl font-semibold text-[var(--admin-ink-900)]">{m.value}</p>
            {m.delta && <p className="text-xs text-[#16a34a] mt-1">{m.delta}</p>}
          </div>
        ))}
      </div>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="admin-eyebrow">Health</p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--admin-ink-900)]">Napi ellenőrzések</h2>
          </div>
          <p className="text-xs text-[var(--admin-ink-500)]">Stock, returns, homepage, media cleanup és promo állapot.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {healthCards.map((card) => (
            <HealthCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      {/* Recent orders table */}
      <div className="admin-table-shell">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">Legutóbbi rendelések</h2>
          <Link
            href="/admin/orders"
            className="admin-inline-link text-xs"
          >
            Összes →
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="admin-table-head">
              {["#", "Vevő", "Összeg", "Státusz", "Dátum"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[.15em] text-[var(--admin-ink-500)]"
                >
                  {col}
                </th>
              ))}
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--admin-ink-500)]">
                  Még nincs fizetett rendelés.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="admin-table-row">
                  <td className="px-5 py-3.5 text-sm font-mono text-[var(--admin-ink-500)]">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[var(--admin-ink-900)]">
                    {order.shippingName}
                    <span className="block text-[11px] text-[var(--admin-ink-500)]">
                      {order.user?.email ?? order.guestEmail ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[var(--admin-ink-900)]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={(order as OrderWithInternalStatus).internalStatus ?? "received"}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[var(--admin-ink-500)]">
                    {new Date(order.createdAt).toLocaleDateString("hu-HU")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="admin-table-link text-[12px] font-medium underline-offset-2 hover:underline"
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-shell mt-6">
        <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--admin-ink-900)]">Legutóbbi aktivitás</h2>
          <Link
            href="/admin/activity"
            className="admin-inline-link text-xs"
          >
            Teljes lista →
          </Link>
        </div>
        <AdminRecentActivityList items={recentActivity} />
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/admin/products",        label: "Termékek" },
          { href: "/admin/activity",        label: "Aktivitás" },
          { href: "/admin/special-edition", label: "Special Edition" },
          { href: "/admin/settings",        label: "Beállítások" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="admin-panel-soft px-4 py-3.5 text-sm font-medium text-[var(--admin-ink-900)] transition hover:border-[#bfd0ea] hover:bg-[var(--admin-blue-050)]"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
