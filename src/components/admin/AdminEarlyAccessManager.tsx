"use client";

import { Search, ShieldCheck } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approveAllEarlyAccessAction,
  toggleEarlyAccessAction,
} from "@/app/(admin)/admin/settings/early-access/actions";

type EarlyAccessUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  earlyAccess: boolean;
  createdAt: string;
};

export function AdminEarlyAccessManager({
  users,
  earlyAccessMode,
}: {
  users: EarlyAccessUser[];
  earlyAccessMode: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rowPendingId, setRowPendingId] = useState<string | null>(null);
  const [bulkPending, startBulkTransition] = useTransition();
  const [rowTransitionPending, startRowTransition] = useTransition();
  const [sendNotificationByUser, setSendNotificationByUser] = useState<Record<string, boolean>>({});

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.name.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, users]);

  const pendingCount = users.filter((user) => user.role !== "ADMIN" && !user.earlyAccess).length;
  const approvedCount = users.filter((user) => user.role === "ADMIN" || user.earlyAccess).length;

  function isNotificationEnabled(userId: string) {
    return sendNotificationByUser[userId] ?? true;
  }

  function setNotificationEnabled(userId: string, enabled: boolean) {
    setSendNotificationByUser((current) => ({ ...current, [userId]: enabled }));
  }

  function handleToggle(user: EarlyAccessUser) {
    setRowPendingId(user.id);
    startRowTransition(async () => {
      try {
        await toggleEarlyAccessAction({
          userId: user.id,
          sendNotification: !user.earlyAccess && isNotificationEnabled(user.id),
        });
        router.refresh();
      } finally {
        setRowPendingId(null);
      }
    });
  }

  function handleApproveAll() {
    startBulkTransition(async () => {
      await approveAllEarlyAccessAction();
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <section className="admin-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--admin-ink-500)]">
              Early access
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--admin-ink-900)]">
              Whitelist alapú korai hozzáférés
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-7 text-[var(--admin-ink-600)]">
              Amíg a mód aktív, a kezdőlap kivételével csak a jóváhagyott vagy admin felhasználók érhetik el a storefront oldalakat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-line-100)] bg-white px-4 py-2 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${earlyAccessMode ? "bg-[#16a34a]" : "bg-[#d97706]"}`} />
              <span className="font-medium text-[var(--admin-ink-900)]">
                Mód: {earlyAccessMode ? "AKTÍV" : "INAKTÍV"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleApproveAll}
              disabled={bulkPending || pendingCount === 0}
              className="admin-button-primary admin-control-md inline-flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {bulkPending ? "Jóváhagyás folyamatban..." : "Mindenkit jóváhagy"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--admin-ink-500)]">Összes felhasználó</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{users.length}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--admin-ink-500)]">Engedélyezve</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{approvedCount}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--admin-ink-500)]">Függőben</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--admin-ink-900)]">{pendingCount}</p>
          </div>
        </div>
      </section>

      <section className="admin-table-shell overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--admin-line-100)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--admin-ink-900)]">Felhasználók</h3>
            <p className="mt-1 text-sm text-[var(--admin-ink-600)]">
              Keresés e-mail vagy név alapján, majd hozzáférés jóváhagyása vagy visszavonása.
            </p>
          </div>
          <label className="relative block w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-ink-500)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Keresés e-mail alapján..."
              className="admin-input h-10 w-full pl-10 pr-3 text-sm"
            />
          </label>
        </div>

        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="admin-table-head">
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[.15em] text-[var(--admin-ink-500)]">Felhasználó</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[.15em] text-[var(--admin-ink-500)]">Szerep</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[.15em] text-[var(--admin-ink-500)]">Állapot</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[.15em] text-[var(--admin-ink-500)]">Értesítés</th>
                <th className="px-5 py-3 text-right text-[11px] uppercase tracking-[.15em] text-[var(--admin-ink-500)]">Művelet</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--admin-ink-500)]">
                    Nincs találat a megadott szűrésre.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.role === "ADMIN";
                  const isPending = rowTransitionPending && rowPendingId === user.id;
                  const isApproved = isAdmin || user.earlyAccess;

                  return (
                    <tr key={user.id} className="admin-table-row">
                      <td className="px-5 py-4 text-sm text-[var(--admin-ink-900)]">
                        <span className="font-medium">{user.email}</span>
                        <span className="mt-1 block text-xs text-[var(--admin-ink-500)]">
                          {user.name} • {new Date(user.createdAt).toLocaleDateString("hu-HU")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">{isAdmin ? "ADMIN" : "USER"}</td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            isApproved
                              ? "bg-[#eef7f1] text-[#256f46]"
                              : "bg-[#fff5e8] text-[#9a5a14]"
                          }`}
                        >
                          {isAdmin ? "Admin bypass" : isApproved ? "Engedélyezve" : "Függőben"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--admin-ink-700)]">
                        {isAdmin ? (
                          "—"
                        ) : (
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isNotificationEnabled(user.id)}
                              onChange={(event) => setNotificationEnabled(user.id, event.target.checked)}
                              disabled={user.earlyAccess}
                            />
                            Email
                          </label>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isAdmin ? (
                          <span className="text-xs text-[var(--admin-ink-500)]">Mindig hozzáfér</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(user)}
                            disabled={isPending}
                            className="admin-button-primary admin-control-sm inline-flex items-center gap-2"
                          >
                            {isPending
                              ? "Mentés..."
                              : user.earlyAccess
                                ? "Hozzáférés visszavonása"
                                : "✓ Jóváhagyás"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {filteredUsers.length === 0 ? (
            <div className="admin-panel-soft px-4 py-8 text-center text-sm text-[var(--admin-ink-500)]">
              Nincs találat a megadott szűrésre.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isAdmin = user.role === "ADMIN";
              const isPending = rowTransitionPending && rowPendingId === user.id;
              const isApproved = isAdmin || user.earlyAccess;

              return (
                <article key={user.id} className="admin-panel-soft p-4">
                  <p className="text-sm font-medium text-[var(--admin-ink-900)]">{user.email}</p>
                  <p className="mt-1 text-xs text-[var(--admin-ink-500)]">
                    {user.name} • {new Date(user.createdAt).toLocaleDateString("hu-HU")}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--admin-ink-500)]">Állapot</p>
                  <p className="mt-1 text-sm text-[var(--admin-ink-800)]">
                    {isAdmin ? "Admin bypass" : isApproved ? "Engedélyezve" : "Függőben"}
                  </p>
                  {!isAdmin ? (
                    <>
                      <label className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--admin-ink-700)]">
                        <input
                          type="checkbox"
                          checked={isNotificationEnabled(user.id)}
                          onChange={(event) => setNotificationEnabled(user.id, event.target.checked)}
                          disabled={user.earlyAccess}
                        />
                        Email értesítés küldése jóváhagyáskor
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggle(user)}
                        disabled={isPending}
                        className="admin-button-primary admin-control-md mt-4 w-full justify-center"
                      >
                        {isPending
                          ? "Mentés..."
                          : user.earlyAccess
                            ? "Hozzáférés visszavonása"
                            : "✓ Jóváhagyás"}
                      </button>
                    </>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
