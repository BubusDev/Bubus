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
