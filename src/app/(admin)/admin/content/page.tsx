import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";

function ContentCard({
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
      className="admin-panel group px-5 py-5 transition duration-200 hover:border-[#bfd0ea] hover:bg-white"
    >
      <p className="admin-eyebrow">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-[family:var(--font-display)] text-[1.35rem] leading-tight tracking-[-0.03em] text-[var(--admin-ink-900)]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--admin-ink-600)]">{description}</p>
      <span className="admin-inline-link mt-5 inline-flex text-sm font-medium transition group-hover:translate-x-1">
        Megnyitás
      </span>
    </Link>
  );
}

export default function AdminContentPage() {
  return (
    <AdminShell title="Tartalom">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ContentCard
          href="/admin/content/homepage"
          eyebrow="Kezdőlap"
          title="Kezdőlap blokkok és válogatás"
          description="Hero, Instagram blokk, kezdőlapi kő- és termékválogatás, valamint a promó csempék kezelése."
        />
        <ContentCard
          href="/admin/content/homepage-showcase"
          eyebrow="Kezdőlap"
          title="Termék showcase tabjai"
          description="A kezdőlap kategória-váltós, scrollozható termékcsúszkájának tabjai és szűrőfeltételei."
        />
        <ContentCard
          href="/admin/content/announcement"
          eyebrow="Kommunikáció"
          title="Üzenetsáv"
          description="A fejlécben megjelenő értesítési sáv szövegének és aktiválásának kezelése."
        />
        <ContentCard
          href="/admin/content/specialties"
          eyebrow="Navigáció"
          title="Különlegességek menü"
          description="A webshop felső navigációjában megjelenő Különlegességek legördülő elemeinek kezelése."
        />
        <ContentCard
          href="/admin/special-edition"
          eyebrow="Kampány"
          title="Kampány bannerek"
          description="A Special Edition és kampányfelületek termékes, képes megjelenéseinek kezelése."
        />
      </div>
    </AdminShell>
  );
}
