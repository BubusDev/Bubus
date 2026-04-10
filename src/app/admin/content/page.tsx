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
      className="admin-panel group px-5 py-5 transition duration-200 hover:-translate-y-[2px] hover:border-[#bfd0ea] hover:shadow-[0_18px_40px_rgba(21,33,61,0.08)]"
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
    <AdminShell
      title="Tartalom"
      description="A webshop szerkesztői tartalmainak kezelése — kövek, üzenetsáv és egyéb szöveges elemek."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ContentCard
          href="/admin/content/stones"
          eyebrow="Féldrágakövek"
          title="Kövek szerkesztő"
          description="A féldrágakövek leírásainak, hatásainak és megjelenítési sorrendjének kezelése."
        />
        <ContentCard
          href="/admin/content/announcement"
          eyebrow="Kommunikáció"
          title="Üzenetsáv"
          description="A fejlécben megjelenő értesítési sáv szövegének és aktiválásának kezelése."
        />
      </div>
    </AdminShell>
  );
}
