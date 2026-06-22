import type { Metadata } from "next";
import Link from "next/link";

import { UserRole } from "@prisma/client";

import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/catalog";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Vásárlók - Chicks Jewelry Admin",
  description: "Read-only vásárlói áttekintés adminoknak.",
  robots: { index: false, follow: false },
};

type AdminCustomersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CustomerRow = {
  couponActivityCount: number;
  createdAt: Date;
  earlyAccess: boolean;
  email: string;
  emailVerifiedAt: Date | null;
  favouriteCount: number;
  id: string;
  lastOrderAt: Date | null;
  name: string;
  paidOrderCount: number;
  role: UserRole;
  totalSpend: number;
  updatedAt: Date;
};

function getSearchValue(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "good" | "warn" | "danger" | "neutral" | "blue";
}) {
  const className =
    tone === "good"
      ? "border-[#bdd7c8] bg-[#f6fbf7] text-[#24533a]"
      : tone === "warn"
        ? "border-[#ead6a7] bg-[#fff9e8] text-[#765b18]"
        : tone === "danger"
          ? "border-[#e3c7cf] bg-[#fff1f3] text-[#99283d]"
          : tone === "blue"
            ? "border-[#c6d8f0] bg-[#f4f8ff] text-[#24579f]"
            : "border-[var(--admin-line-100)] bg-white text-[var(--admin-ink-600)]";

  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <section className="admin-panel p-5">
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--admin-ink-600)]">{helper}</p>
    </section>
  );
}

function matchesSearch(customer: CustomerRow, search: string) {
  if (!search) return true;
  const normalized = search.toLowerCase();
  return customer.name.toLowerCase().includes(normalized) || customer.email.toLowerCase().includes(normalized);
}

function filterCustomers(
  customers: CustomerRow[],
  filters: {
    earlyAccess: string;
    hasOrders: string;
    role: string;
    search: string;
    verified: string;
  },
) {
  return customers.filter((customer) => {
    if (!matchesSearch(customer, filters.search)) return false;
    if (filters.role && filters.role !== "all" && customer.role !== filters.role) return false;
    if (filters.verified === "verified" && !customer.emailVerifiedAt) return false;
    if (filters.verified === "unverified" && customer.emailVerifiedAt) return false;
    if (filters.earlyAccess === "yes" && !customer.earlyAccess) return false;
    if (filters.earlyAccess === "no" && customer.earlyAccess) return false;
    if (filters.hasOrders === "yes" && customer.paidOrderCount === 0) return false;
    if (filters.hasOrders === "no" && customer.paidOrderCount > 0) return false;
    return true;
  });
}

async function getCustomerRows(): Promise<CustomerRow[]> {
  const [users, paidOrderStats] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
        earlyAccess: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favourites: true,
            promoCodeGrants: true,
            promoCodeRedemptions: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.order.groupBy({
      by: ["userId"],
      where: { paymentStatus: "PAID", userId: { not: null } },
      _count: { _all: true },
      _sum: { total: true },
      _max: { createdAt: true },
    }),
  ]);
  const paidOrderStatsByUserId = new Map<
    string,
    { lastOrderAt: Date | null; paidOrderCount: number; totalSpend: number }
  >();
  for (const stat of paidOrderStats) {
    if (!stat.userId) continue;
    paidOrderStatsByUserId.set(stat.userId, {
      lastOrderAt: stat._max.createdAt,
      paidOrderCount: stat._count._all,
      totalSpend: stat._sum.total ?? 0,
    });
  }

  return users.map((user) => {
    const paidStats = paidOrderStatsByUserId.get(user.id);

    return {
      couponActivityCount: user._count.promoCodeGrants + user._count.promoCodeRedemptions,
      createdAt: user.createdAt,
      earlyAccess: user.earlyAccess,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      favouriteCount: user._count.favourites,
      id: user.id,
      lastOrderAt: paidStats?.lastOrderAt ?? null,
      name: user.name,
      paidOrderCount: paidStats?.paidOrderCount ?? 0,
      role: user.role,
      totalSpend: paidStats?.totalSpend ?? 0,
      updatedAt: user.updatedAt,
    };
  });
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  const [params, customers] = await Promise.all([searchParams, getCustomerRows()]);

  const filters = {
    earlyAccess: getSearchValue(params, "earlyAccess") || "all",
    hasOrders: getSearchValue(params, "hasOrders") || "all",
    role: getSearchValue(params, "role") || "all",
    search: getSearchValue(params, "q").trim(),
    verified: getSearchValue(params, "verified") || "all",
  };
  const filteredCustomers = filterCustomers(customers, filters);
  const verifiedCount = customers.filter((customer) => customer.emailVerifiedAt).length;
  const earlyAccessCount = customers.filter((customer) => customer.earlyAccess).length;
  const customersWithPaidOrders = customers.filter((customer) => customer.paidOrderCount > 0).length;
  const totalCustomerRevenue = customers.reduce((sum, customer) => sum + customer.totalSpend, 0);

  return (
    <AdminShell title="Vásárlók">
      <div className="space-y-6">
        <section className="admin-panel-muted px-4 py-3 text-sm leading-6 text-[var(--admin-ink-700)]">
          Read-only customer inventory. Role, email verification, early access és order adatok csak megjelenítésre
          szolgálnak; ezen az oldalon nincs szerkesztési vagy törlési művelet.
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Összes user" value={String(customers.length)} helper="Regisztrált fiókok" />
          <SummaryCard label="Verified" value={String(verifiedCount)} helper="Emaillel megerősítve" />
          <SummaryCard label="Unverified" value={String(customers.length - verifiedCount)} helper="Megerősítés nélkül" />
          <SummaryCard label="Early access" value={String(earlyAccessCount)} helper="Engedélyezett flag" />
          <SummaryCard label="Paid customer" value={String(customersWithPaidOrders)} helper="Legalább 1 fizetett rendelés" />
          <SummaryCard label="Revenue" value={formatPrice(totalCustomerRevenue)} helper="Paid order összesen" />
        </div>

        <form className="admin-panel-soft grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_12rem_12rem_auto] lg:items-end">
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Keresés</span>
            <input
              name="q"
              defaultValue={filters.search}
              placeholder="Email vagy név"
              className="admin-input h-10 px-3 text-sm"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Role</span>
            <select name="role" defaultValue={filters.role} className="admin-input h-10 px-3 text-sm">
              <option value="all">Összes</option>
              <option value={UserRole.ADMIN}>ADMIN</option>
              <option value={UserRole.USER}>USER</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Email state</span>
            <select name="verified" defaultValue={filters.verified} className="admin-input h-10 px-3 text-sm">
              <option value="all">Összes</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Early access</span>
            <select name="earlyAccess" defaultValue={filters.earlyAccess} className="admin-input h-10 px-3 text-sm">
              <option value="all">Összes</option>
              <option value="yes">Early access</option>
              <option value="no">Nincs early access</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">Orders</span>
            <select name="hasOrders" defaultValue={filters.hasOrders} className="admin-input h-10 px-3 text-sm">
              <option value="all">Összes</option>
              <option value="yes">Van paid order</option>
              <option value="no">Nincs paid order</option>
            </select>
          </label>
          <button type="submit" className="admin-button-primary admin-control-md">
            Szűrés
          </button>
        </form>

        <section className="admin-table-shell hidden overflow-hidden md:block">
          <div className="flex items-center justify-between border-b border-[var(--admin-line-100)] px-4 py-3">
            <div>
              <p className="admin-eyebrow">Customer list</p>
              <p className="mt-1 text-sm text-[var(--admin-ink-600)]">
                {filteredCustomers.length} találat / {customers.length} user
              </p>
            </div>
            <p className="text-xs text-[var(--admin-ink-500)]">Read-only</p>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="admin-table-head">
                <th className="px-4 py-3 font-medium">Vásárló</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 font-medium">Dátumok</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="admin-table-row">
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="admin-table-link font-medium hover:underline"
                    >
                      {customer.name || "Név nélkül"}
                    </Link>
                    <div className="mt-1 text-xs text-[var(--admin-ink-600)]">{customer.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={customer.role === UserRole.ADMIN ? "blue" : "neutral"}>{customer.role}</Badge>
                      <Badge tone={customer.emailVerifiedAt ? "good" : "warn"}>
                        {customer.emailVerifiedAt ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge tone={customer.earlyAccess ? "good" : "neutral"}>
                        {customer.earlyAccess ? "Early access" : "No early access"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[var(--admin-ink-900)]">{customer.paidOrderCount} paid</div>
                    <div className="mt-1 text-xs text-[var(--admin-ink-600)]">{formatPrice(customer.totalSpend)}</div>
                    <div className="mt-2">
                      <Badge tone={customer.paidOrderCount > 0 ? "good" : "neutral"}>
                        {customer.paidOrderCount > 0 ? "Has orders" : "No orders"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs leading-5 text-[var(--admin-ink-600)]">
                    <div>{customer.favouriteCount} kedvenc</div>
                    <div>{customer.couponActivityCount} kupon grant/redemption</div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs leading-5 text-[var(--admin-ink-600)]">
                    <div>Reg: {formatDate(customer.createdAt)}</div>
                    <div>Update: {formatDate(customer.updatedAt)}</div>
                    <div>Last order: {formatDate(customer.lastOrderAt)}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="admin-button-secondary admin-control-sm"
                    >
                      Részletek
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 ? (
            <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
              Nincs találat ezekkel a szűrőkkel.
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 md:hidden">
          <div className="admin-panel-soft px-4 py-3 text-sm text-[var(--admin-ink-600)]">
            {filteredCustomers.length} találat / {customers.length} user
          </div>
          {filteredCustomers.length === 0 ? (
            <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
              Nincs találat ezekkel a szűrőkkel.
            </div>
          ) : null}
          {filteredCustomers.map((customer) => (
            <article key={customer.id} className="admin-panel-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="admin-table-link block truncate font-medium hover:underline"
                  >
                    {customer.name || "Név nélkül"}
                  </Link>
                  <p className="mt-1 break-all text-xs text-[var(--admin-ink-600)]">{customer.email}</p>
                </div>
                <Badge tone={customer.role === UserRole.ADMIN ? "blue" : "neutral"}>{customer.role}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone={customer.emailVerifiedAt ? "good" : "warn"}>
                  {customer.emailVerifiedAt ? "Verified" : "Unverified"}
                </Badge>
                <Badge tone={customer.earlyAccess ? "good" : "neutral"}>
                  {customer.earlyAccess ? "Early access" : "No early access"}
                </Badge>
                <Badge tone={customer.paidOrderCount > 0 ? "good" : "neutral"}>
                  {customer.paidOrderCount > 0 ? "Has orders" : "No orders"}
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--admin-ink-600)]">
                <div>
                  <dt className="admin-eyebrow">Paid orders</dt>
                  <dd className="mt-1 font-medium text-[var(--admin-ink-900)]">{customer.paidOrderCount}</dd>
                </div>
                <div>
                  <dt className="admin-eyebrow">Spend</dt>
                  <dd className="mt-1 font-medium text-[var(--admin-ink-900)]">{formatPrice(customer.totalSpend)}</dd>
                </div>
                <div>
                  <dt className="admin-eyebrow">Kedvencek</dt>
                  <dd className="mt-1">{customer.favouriteCount}</dd>
                </div>
                <div>
                  <dt className="admin-eyebrow">Kupon aktivitás</dt>
                  <dd className="mt-1">{customer.couponActivityCount}</dd>
                </div>
                <div>
                  <dt className="admin-eyebrow">Regisztráció</dt>
                  <dd className="mt-1">{formatDate(customer.createdAt)}</dd>
                </div>
                <div>
                  <dt className="admin-eyebrow">Utolsó rendelés</dt>
                  <dd className="mt-1">{formatDate(customer.lastOrderAt)}</dd>
                </div>
              </dl>
              <Link
                href={`/admin/customers/${customer.id}`}
                className="admin-button-secondary admin-control-md mt-4 w-full"
              >
                Részletek
              </Link>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
