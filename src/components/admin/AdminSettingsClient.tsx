"use client";

import { useState, useRef } from "react";
import {
  User,
  Lock,
  Store,
  Bell,
  Plug,
  Camera,
  Eye,
  EyeOff,
  ShoppingBag,
  RefreshCw,
  Package,
  BarChart2,
  Monitor,
  Smartphone,
} from "lucide-react";

import {
  updateNotificationPreferencesAction,
  updateProfileAction,
} from "@/app/(admin)/admin/settings/actions";

type Tab = "profile" | "security" | "general" | "notifications" | "integrations";

const navGroups = [
  {
    label: "Fiók",
    items: [
      { key: "profile" as Tab, label: "Profil", Icon: User },
      { key: "security" as Tab, label: "Biztonság", Icon: Lock },
    ],
  },
  {
    label: "Bolt",
    items: [
      { key: "general" as Tab, label: "Általános", Icon: Store },
      { key: "notifications" as Tab, label: "Értesítések", Icon: Bell },
      { key: "integrations" as Tab, label: "Integráció", Icon: Plug },
    ],
  },
];

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  adminNotifyNewOrder: boolean;
  adminNotifyReturnRequest: boolean;
  adminNotifyLowStock: boolean;
  adminNotifyWeeklySummary: boolean;
};

export function AdminSettingsClient({ user }: { user: AdminUser }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  async function handleSave(formData: FormData) {
    await updateProfileAction(formData);
    setSaveMessage("Módosítások mentve!");
    setTimeout(() => setSaveMessage(null), 3000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      {/* Left nav */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="admin-panel overflow-hidden">
          {navGroups.map((group) => (
            <div key={group.label} className="px-3 py-3 first:pt-4 last:pb-4">
              <p className="mb-1.5 px-2 text-[9px] uppercase tracking-[0.3em] text-[var(--admin-ink-500)]">
                {group.label}
              </p>
              {group.items.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition ${
                    activeTab === key
                      ? "border-l-2 border-[var(--admin-blue-600)] bg-[rgba(42,99,181,0.08)] font-medium text-[var(--admin-blue-700)]"
                      : "text-[var(--admin-ink-700)] hover:bg-[var(--admin-surface-100)] hover:text-[var(--admin-ink-900)]"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Right content */}
      <div className="min-w-0 space-y-5">
        {activeTab === "profile" && (
          <form action={handleSave} className="space-y-5">
            <ProfilePanel user={user} />

            <div className="admin-panel-soft sticky bottom-0 z-10 flex items-center justify-between gap-3 px-5 py-3 backdrop-blur-xl">
              {saveMessage ? (
                <span className="text-sm text-[#3f6f4f]">{saveMessage}</span>
              ) : (
                <span className="text-sm text-[var(--admin-ink-500)]">Nem mentett változtatások</span>
              )}
              <button
                type="submit"
                className="admin-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                Mentés
              </button>
            </div>
          </form>
        )}

        {activeTab === "security" && <SecurityPanel />}
        {activeTab === "general" && <GeneralPanel />}
        {activeTab === "notifications" && (
          <NotificationsPanel
            user={user}
            onSaved={() => {
              setSaveMessage("Értesítési beállítások mentve!");
              setTimeout(() => setSaveMessage(null), 3000);
            }}
          />
        )}
        {activeTab === "integrations" && <IntegrationsPanel />}
      </div>
    </div>
  );
}

/* ─── Profile panel ──────────────────────────────────────────── */
function ProfilePanel({ user }: { user: AdminUser }) {
  return (
    <Card title="Profil adatok" description="Személyes adataid és megjelenésed az admin felületen.">
      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="group relative h-20 w-20 cursor-pointer overflow-hidden border border-[var(--admin-line-100)] bg-[var(--admin-surface-100)]">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <div className="flex h-full w-full items-center justify-center bg-[rgba(31,79,150,0.42)]">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="flex h-full w-full items-center justify-center font-[family:var(--font-display)] text-2xl text-[var(--admin-blue-700)]">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--admin-ink-900)]">Profilkép</p>
          <p className="mt-0.5 text-xs text-[var(--admin-ink-500)]">Kattints a cserére</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teljes név" name="name" defaultValue={user.name} required />
        <Field label="E-mail cím" name="email" type="email" defaultValue={user.email} disabled />
        <Field label="Telefonszám" name="phone" type="tel" defaultValue={user.phone ?? ""} />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm text-[var(--admin-ink-700)]">Rövid bemutatkozás</label>
          <textarea
            name="bio"
            rows={3}
            placeholder="Írj pár mondatot magadról..."
            className="admin-textarea resize-none px-4 py-3 text-sm"
          />
        </div>
      </div>
    </Card>
  );
}

/* ─── Security panel ─────────────────────────────────────────── */
function SecurityPanel() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  const sessions = [
    { device: "MacBook Pro", lastSeen: "Most aktív", icon: Monitor },
    { device: "iPhone 15", lastSeen: "2 napja", icon: Smartphone },
  ];

  return (
    <Card title="Biztonság" description="Jelszó és munkamenet kezelés.">
      <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[var(--admin-ink-500)]">Jelszó csere</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField label="Jelenlegi jelszó" name="currentPassword" show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
        <div />
        <PasswordField label="Új jelszó" name="newPassword" show={showNew} toggle={() => setShowNew(!showNew)} />
        <PasswordField label="Megerősítés" name="confirmPassword" show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
      </div>

      <hr className="my-6 border-[var(--admin-line-100)]" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--admin-ink-900)]">Kétfaktoros hitelesítés</p>
          <p className="mt-0.5 text-xs text-[var(--admin-ink-500)]">Fokozottabb fiókbiztonság SMS kóddal</p>
        </div>
        <AdminToggle enabled={twoFaEnabled} onChange={setTwoFaEnabled} />
      </div>

      <hr className="my-6 border-[var(--admin-line-100)]" />

      <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[var(--admin-ink-500)]">Aktív munkamenetek</p>
      <div className="space-y-2">
        {sessions.map(({ device, lastSeen, icon: Icon }) => (
          <div key={device} className="admin-panel-soft flex items-center gap-3 px-4 py-3">
            <Icon className="h-4 w-4 text-[var(--admin-ink-500)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--admin-ink-900)]">{device}</p>
              <p className="text-xs text-[var(--admin-ink-500)]">{lastSeen}</p>
            </div>
            <button type="button" className="admin-inline-link text-xs hover:underline">Kijelentkeztetés</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── General panel ──────────────────────────────────────────── */
function GeneralPanel() {
  return (
    <Card title="Bolt — Általános" description="Az üzlet neve, URL-je és alapadatai.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bolt neve" name="shopName" defaultValue="Chicks Jewelry" />
        <Field label="URL azonosító" name="shopSlug" defaultValue="chicks-jewelry" />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm text-[var(--admin-ink-700)]">Leírás</label>
          <textarea
            name="shopDescription"
            rows={2}
            defaultValue="Kézzel alkotott féldrágaköves ékszerek."
            className="admin-textarea resize-none px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[var(--admin-ink-700)]">Pénznem</label>
          <select
            name="currency"
            defaultValue="HUF"
            className="admin-select px-4 py-3 text-sm"
          >
            <option value="HUF">HUF — Magyar forint</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[var(--admin-ink-700)]">Időzóna</label>
          <select
            name="timezone"
            defaultValue="Europe/Budapest"
            className="admin-select px-4 py-3 text-sm"
          >
            <option value="Europe/Budapest">Europe/Budapest (UTC+1/+2)</option>
            <option value="Europe/London">Europe/London (UTC+0/+1)</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

/* ─── Notifications panel ────────────────────────────────────── */
function NotificationsPanel({
  user,
  onSaved,
}: {
  user: AdminUser;
  onSaved: () => void;
}) {
  const toggles = [
    { key: "adminNotifyNewOrder", Icon: ShoppingBag, label: "Új rendelés", desc: "Értesítés minden beérkező rendelésről" },
    { key: "adminNotifyReturnRequest", Icon: RefreshCw, label: "Visszaállítási kérés", desc: "Ha egy vásárló visszaküldési kérelmet nyújt be" },
    { key: "adminNotifyLowStock", Icon: Package, label: "Alacsony készlet", desc: "Ha egy termék 3 db alá csökken" },
    { key: "adminNotifyWeeklySummary", Icon: BarChart2, label: "Heti összesítő", desc: "Rendelések és forgalom minden hétfőn" },
  ];
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    adminNotifyNewOrder: user.adminNotifyNewOrder,
    adminNotifyReturnRequest: user.adminNotifyReturnRequest,
    adminNotifyLowStock: user.adminNotifyLowStock,
    adminNotifyWeeklySummary: user.adminNotifyWeeklySummary,
  });

  return (
    <form
      action={async (formData) => {
        await updateNotificationPreferencesAction(formData);
        onSaved();
      }}
    >
      <Card title="Értesítések" description="Döntsd el, mikor és miről értesítsen a rendszer.">
        <div className="space-y-1">
          {toggles.map(({ key, Icon, label, desc }) => (
            <div key={key} className="flex items-center gap-4 rounded-[1.2rem] px-3 py-3 transition hover:bg-[var(--admin-surface-100)]">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--admin-blue-100)]">
                <Icon className="h-4 w-4 text-[var(--admin-blue-700)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--admin-ink-900)]">{label}</p>
                <p className="text-xs text-[var(--admin-ink-500)]">{desc}</p>
              </div>
              {enabled[key] ? <input type="hidden" name={key} value="on" /> : null}
              <AdminToggle enabled={enabled[key]!} onChange={(v) => setEnabled((p) => ({ ...p, [key]: v }))} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="admin-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            Mentés
          </button>
        </div>
      </Card>
    </form>
  );
}

/* ─── Integrations panel ─────────────────────────────────────── */
function IntegrationsPanel() {
  return (
    <Card title="Integráció" description="Külső szolgáltatások összekapcsolása.">
      <div className="space-y-3">
        {[
          { name: "Stripe", desc: "Fizetési feldolgozó", status: "Csatlakoztatva" },
          { name: "Vercel Blob", desc: "Képtárolás", status: "Csatlakoztatva" },
          { name: "Mailjet", desc: "E-mail küldés", status: "Nincs beállítva" },
        ].map(({ name, desc, status }) => (
          <div key={name} className="admin-panel-soft flex items-center gap-4 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--admin-ink-900)]">{name}</p>
              <p className="text-xs text-[var(--admin-ink-500)]">{desc}</p>
            </div>
            <span className={`rounded-sm px-2.5 py-1 text-xs font-medium ${status === "Csatlakoztatva" ? "border border-[#d6e8dc] bg-[#f6fbf7] text-[#3f6f4f]" : "admin-badge-neutral"}`}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── Shared sub-components ──────────────────────────────────── */
function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="admin-panel overflow-hidden p-6 sm:p-8">
      <h2 className="font-[family:var(--font-display)] text-[1.5rem] leading-tight text-[var(--admin-ink-900)]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--admin-ink-500)]">{description}</p>
      <hr className="my-5 border-[var(--admin-line-100)]" />
      {children}
    </div>
  );
}

function Field({
  label, name, defaultValue = "", type = "text", required = false, disabled = false,
}: {
  label: string; name: string; defaultValue?: string; type?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[var(--admin-ink-700)]">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        className="admin-input px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function PasswordField({
  label, name, show, toggle,
}: {
  label: string; name: string; show: boolean; toggle: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[var(--admin-ink-700)]">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          className="admin-input px-4 py-3 pr-11 text-sm"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-ink-500)] hover:text-[var(--admin-blue-700)]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function AdminToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer items-center rounded-sm border transition-all duration-200 ${enabled ? "border-[var(--admin-blue-600)] bg-[rgba(42,99,181,0.14)]" : "border-[var(--admin-line-200)] bg-[var(--admin-surface-100)]"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 translate-x-1 rounded-[2px] bg-white ring-1 ring-black/5 transition-transform duration-200 ${enabled ? "translate-x-5" : ""}`}
      />
    </button>
  );
}
