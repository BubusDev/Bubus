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

import { updateProfileAction } from "@/app/admin/settings/actions";

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
        <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] shadow-[0_16px_40px_rgba(191,117,162,0.1)] backdrop-blur-xl">
          {navGroups.map((group) => (
            <div key={group.label} className="px-3 py-3 first:pt-4 last:pb-4">
              <p className="mb-1.5 px-2 text-[9px] uppercase tracking-[0.3em] text-[#b08898]">
                {group.label}
              </p>
              {group.items.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                    activeTab === key
                      ? "border-l-2 border-[#d95f92] bg-[#fff0f7] font-medium text-[#c45a85]"
                      : "text-[#6b4a5e] hover:bg-white/60 hover:text-[#4d2741]"
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

            <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-[1.5rem] border border-rose-100 bg-white/70 px-5 py-3 backdrop-blur-xl shadow-[0_-4px_20px_rgba(196,90,133,0.06)]">
              {saveMessage ? (
                <span className="text-sm text-[#3f6f4f]">{saveMessage}</span>
              ) : (
                <span className="text-sm text-[#9b7a8b]">Nem mentett változtatások</span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ec7cb2,#d95f92)] px-6 py-2.5 text-sm font-medium text-white shadow-[0_8px_22px_rgba(217,95,146,0.28)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(217,95,146,0.34)]"
              >
                Mentés
              </button>
            </div>
          </form>
        )}

        {activeTab === "security" && <SecurityPanel />}
        {activeTab === "general" && <GeneralPanel />}
        {activeTab === "notifications" && <NotificationsPanel />}
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
        <div className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-gradient-to-br from-[#f5dcea] to-[#e8c4d8] shadow-[0_4px_16px_rgba(196,90,133,0.18)]">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <div className="flex h-full w-full items-center justify-center bg-[#c45a85]/50">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="flex h-full w-full items-center justify-center font-[family:var(--font-display)] text-2xl text-[#9b476f]">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#4d2741]">Profilkép</p>
          <p className="mt-0.5 text-xs text-[#9b7a8b]">Kattints a cserére</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teljes név" name="name" defaultValue={user.name} required />
        <Field label="E-mail cím" name="email" type="email" defaultValue={user.email} disabled />
        <Field label="Telefonszám" name="phone" type="tel" defaultValue={user.phone ?? ""} />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm text-[#5b344c]">Rövid bemutatkozás</label>
          <textarea
            name="bio"
            rows={3}
            placeholder="Írj pár mondatot magadról..."
            className="w-full resize-none rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition placeholder:text-[#b188a4] focus:border-[#d95f92] focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)] focus:bg-white/96"
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
      <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#b08898]">Jelszó csere</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField label="Jelenlegi jelszó" name="currentPassword" show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
        <div />
        <PasswordField label="Új jelszó" name="newPassword" show={showNew} toggle={() => setShowNew(!showNew)} />
        <PasswordField label="Megerősítés" name="confirmPassword" show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
      </div>

      <hr className="my-6 border-[#f0dbe6]" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#4d2741]">Kétfaktoros hitelesítés</p>
          <p className="mt-0.5 text-xs text-[#9b7a8b]">Fokozottabb fiókbiztonság SMS kóddal</p>
        </div>
        <RoseToggle enabled={twoFaEnabled} onChange={setTwoFaEnabled} />
      </div>

      <hr className="my-6 border-[#f0dbe6]" />

      <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#b08898]">Aktív munkamenetek</p>
      <div className="space-y-2">
        {sessions.map(({ device, lastSeen, icon: Icon }) => (
          <div key={device} className="flex items-center gap-3 rounded-[1.2rem] border border-[#f2dde8] bg-white/60 px-4 py-3">
            <Icon className="h-4 w-4 text-[#b08898]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#4d2741]">{device}</p>
              <p className="text-xs text-[#9b7a8b]">{lastSeen}</p>
            </div>
            <button type="button" className="text-xs text-[#c45a85] hover:underline">Kijelentkeztetés</button>
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
          <label className="mb-1.5 block text-sm text-[#5b344c]">Leírás</label>
          <textarea
            name="shopDescription"
            rows={2}
            defaultValue="Kézzel alkotott féldrágaköves ékszerek."
            className="w-full resize-none rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition placeholder:text-[#b188a4] focus:border-[#d95f92] focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[#5b344c]">Pénznem</label>
          <select
            name="currency"
            defaultValue="HUF"
            className="w-full rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition focus:border-[#d95f92] focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
          >
            <option value="HUF">HUF — Magyar forint</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[#5b344c]">Időzóna</label>
          <select
            name="timezone"
            defaultValue="Europe/Budapest"
            className="w-full rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition focus:border-[#d95f92] focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
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
function NotificationsPanel() {
  const toggles = [
    { key: "newOrder", Icon: ShoppingBag, label: "Új rendelés", desc: "Értesítés minden beérkező rendelésről" },
    { key: "restore", Icon: RefreshCw, label: "Visszaállítási kérés", desc: "Ha egy vásárló visszaküldési kérelmet nyújt be" },
    { key: "lowStock", Icon: Package, label: "Alacsony készlet", desc: "Ha egy termék 3 db alá csökken" },
    { key: "weekly", Icon: BarChart2, label: "Heti összesítő", desc: "Rendelések és forgalom minden hétfőn" },
  ];
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    newOrder: true, restore: false, lowStock: true, weekly: true,
  });

  return (
    <Card title="Értesítések" description="Döntsd el, mikor és miről értesítsen a rendszer.">
      <div className="space-y-1">
        {toggles.map(({ key, Icon, label, desc }) => (
          <div key={key} className="flex items-center gap-4 rounded-[1.2rem] px-3 py-3 transition hover:bg-white/40">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff0f7]">
              <Icon className="h-4 w-4 text-[#c45a85]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#4d2741]">{label}</p>
              <p className="text-xs text-[#9b7a8b]">{desc}</p>
            </div>
            <RoseToggle enabled={enabled[key]!} onChange={(v) => setEnabled((p) => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>
    </Card>
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
          <div key={name} className="flex items-center gap-4 rounded-[1.2rem] border border-[#f2dde8] bg-white/60 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#4d2741]">{name}</p>
              <p className="text-xs text-[#9b7a8b]">{desc}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === "Csatlakoztatva" ? "bg-[#f0faf3] text-[#3f6f4f]" : "bg-[#fff4f7] text-[#9b7a8b]"}`}>
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
    <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] p-6 shadow-[0_20px_50px_rgba(198,129,167,0.12)] backdrop-blur-xl sm:p-8">
      <h2 className="font-[family:var(--font-display)] text-[1.5rem] leading-tight text-[#4d2741]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#9b7a8b]">{description}</p>
      <hr className="my-5 border-[#f0dbe6]" />
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
      <label className="mb-1.5 block text-sm text-[#5b344c]">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        className="w-full rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition placeholder:text-[#b188a4] focus:border-[#d95f92] focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)] focus:bg-white/96 disabled:cursor-not-allowed disabled:opacity-50"
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
      <label className="mb-1.5 block text-sm text-[#5b344c]">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          className="w-full rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 pr-11 text-sm text-[#31192d] outline-none transition focus:border-[#d95f92] focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b08898] hover:text-[#c45a85]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function RoseToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 ${enabled ? "bg-[linear-gradient(135deg,#ec7cb2,#d95f92)] shadow-[0_4px_12px_rgba(217,95,146,0.3)]" : "bg-[#e8d4de]"}`}
    >
      <span
        className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-5" : ""}`}
      />
    </button>
  );
}
