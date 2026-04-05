import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminAnnouncementBar } from "@/lib/announcement-bar";
import { db } from "@/lib/db";
import { getSpecialEditionCampaign } from "@/lib/products";

type StatItem = {
  label: string;
  value: string | number;
  note: string;
};

function StatCard({ label, value, note }: StatItem) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-[#ead9e2] bg-[#fffafc] p-6 transition duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_50px_rgba(99,46,73,0.08)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9a9c4] to-transparent opacity-70" />

      <p className="text-[10px] uppercase tracking-[0.34em] text-[#b07c97]">
        {label}
      </p>

      <div className="mt-5 flex items-end gap-3">
        <p className="font-[family:var(--font-display)] text-[3rem] leading-none tracking-[-0.04em] text-[#442437] md:text-[3.4rem]">
          {value}
        </p>
      </div>

      <p className="mt-4 max-w-[26ch] text-sm leading-6 text-[#7b6170]">
        {note}
      </p>
    </div>
  );
}

function ActionLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const baseClassName =
    "inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-medium transition duration-200";

  const variantClassName =
    variant === "primary"
      ? "bg-[#4b2339] text-white shadow-[0_18px_40px_rgba(75,35,57,0.18)] hover:bg-[#5b2c46]"
      : "border border-[#e8d9e1] bg-white text-[#5f3d50] hover:border-[#d9b7c8] hover:bg-[#fff7fa]";

  return (
    <Link href={href} className={`${baseClassName} ${variantClassName}`}>
      {children}
    </Link>
  );
}

function QuickLinkCard({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.6rem] border border-[#e7d5df] bg-white px-5 py-5 transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_16px_35px_rgba(99,46,73,0.08)]"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#b07c97]">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-[family:var(--font-display)] text-[1.35rem] leading-tight tracking-[-0.03em] text-[#432335]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#735d69]">{description}</p>
      <span className="mt-5 inline-flex text-sm font-medium text-[#5f3d50] transition group-hover:translate-x-1">
        Megnyitás
      </span>
    </Link>
  );
}

export default async function AdminPage() {
  const [
    productCount,
    spotlightCount,
    newArrivalCount,
    userCount,
    specialEditionCampaign,
    announcement,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { homepagePlacement: "SPOTLIGHT" } }),
    db.product.count({ where: { homepagePlacement: "NEW_ARRIVALS" } }),
    db.user.count(),
    getSpecialEditionCampaign(),
    getAdminAnnouncementBar(),
  ]);

  const stats: StatItem[] = [
    {
      label: "Termékek",
      value: productCount,
      note: "A jelenleg elérhető termékek száma a katalógusban.",
    },
    {
      label: "Fókuszban",
      value: spotlightCount,
      note: "Ennyi termék jelenik meg a kezdőlapon kiemeltként.",
    },
    {
      label: "Újdonságok",
      value: newArrivalCount,
      note: "Ennyi termék van újdonságként megjelölve a kezdőlapon.",
    },
    {
      label: "Felhasználók",
      value: userCount,
      note: "A regisztrált vásárlói fiókok teljes száma.",
    },
    {
      label: "Special Edition",
      value: specialEditionCampaign?.isActive ? "Aktív" : "Inaktív",
      note: specialEditionCampaign?.isActive
        ? `${specialEditionCampaign?.entries.length ?? 0} elem szerepel az aktív kampányban.`
        : "Jelenleg nincs aktív Special Edition kampány.",
    },
    {
      label: "Üzenetsáv",
      value: announcement.isActive ? "Aktív" : "Inaktív",
      note: announcement.isActive
        ? announcement.text || "Az üzenetsáv aktív, de nincs megadott szöveg."
        : "Jelenleg nincs közzétett üzenet a felső sávban.",
    },
  ];

  return (
    <AdminShell
      title="Admin felület"
      description="A termékek, kezdőlapi megjelenések, kampányok és az üzenetsáv kezelése egy helyen."
    >
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[#ead9e2] bg-gradient-to-br from-[#fffafd] via-[#fff7fb] to-[#f9eef4] px-6 py-8 shadow-[0_30px_80px_rgba(99,46,73,0.08)] md:px-8 md:py-10">
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#f6d8e7] blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#f1d3df] blur-3xl opacity-40" />

        <div className="relative z-10 max-w-[78ch]">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#b07c97]">
            Áttekintés
          </p>

          <h1 className="mt-4 max-w-[14ch] font-[family:var(--font-display)] text-[2.5rem] leading-[0.95] tracking-[-0.05em] text-[#432335] md:text-[4rem]">
            Webshop állapot és kezelés
          </h1>

          <p className="mt-5 max-w-[58ch] text-sm leading-7 text-[#735d69] md:text-[15px]">
            Itt látod a katalógus állapotát, a kiemelt termékeket, az aktív
            kampányokat és az üzenetsáv tartalmát.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ActionLink href="/admin/products" variant="primary">
              Termékkezelés
            </ActionLink>
            <ActionLink href="/admin/special-edition">
              Special Edition
            </ActionLink>
            <ActionLink href="/admin/announcement">
              Üzenetsáv szerkesztése
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mt-8 rounded-[2.3rem] border border-[#ead9e2] bg-[#fffafc] p-6 shadow-[0_24px_60px_rgba(99,46,73,0.06)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#b07c97]">
              Gyors műveletek
            </p>

            <h2 className="mt-4 max-w-[17ch] font-[family:var(--font-display)] text-[2rem] leading-tight tracking-[-0.04em] text-[#432335] md:text-[2.6rem]">
              A legfontosabb admin feladatok innen érhetők el
            </h2>

            <p className="mt-4 max-w-[60ch] text-sm leading-7 text-[#735d69]">
              A termékek kezelése, a Special Edition kampány beállítása és az
              üzenetsáv frissítése külön felületen történik. Innen mindegyik
              gyorsan megnyitható.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickLinkCard
              href="/admin/products"
              eyebrow="Katalógus"
              title="Termékek kezelése"
              description="Új termék létrehozása, meglévő termék szerkesztése, készlet és megjelenés kezelése."
            />

            <QuickLinkCard
              href="/admin/special-edition"
              eyebrow="Kampány"
              title="Special Edition beállításai"
              description="A kampány állapotának, elemeinek és megjelenésének módosítása."
            />

            <QuickLinkCard
              href="/admin/announcement"
              eyebrow="Kommunikáció"
              title="Üzenetsáv szerkesztése"
              description="A felső értesítési sáv szövegének és aktiválásának kezelése."
            />
          </div>
        </div>
      </section>
    </AdminShell>
  );
}