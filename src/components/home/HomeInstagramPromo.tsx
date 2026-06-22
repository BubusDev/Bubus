"use client";

import Image from "next/image";
import { useState } from "react";

import type { HomepageBlockView } from "@/lib/homepage-content";

type HomeInstagramPromoProps = {
  block: HomepageBlockView;
};

type SocialTab = "instagram" | "facebook" | "team";

const tabs: { id: SocialTab; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "team", label: "Csapatunk" },
];

type TeamMember = {
  name: string;
  role: string;
  imageUrl?: string;
};

const teamMembers: TeamMember[] = [
  { name: "Bubus", role: "Alapító · Tervező" },
  { name: "Csapatag", role: "Kézműves" },
  { name: "Csapatag", role: "Ügyfélszolgálat" },
];

function SocialImage({ block, label }: { block: HomepageBlockView; label: string }) {
  return (
    <div className="relative min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.82),rgba(248,204,224,0.72)_38%,rgba(226,150,183,0.72)_100%)] sm:min-h-[420px] lg:min-h-[500px]">
      {block.imageUrl ? (
        <Image
          src={block.imageUrl}
          alt={block.imageAlt || label}
          fill
          sizes="(max-width: 1024px) 100vw, 620px"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(45,26,22,0.02),rgba(45,26,22,0.16))]" />
    </div>
  );
}

function SocialPanel({
  block,
  eyebrow,
  titleStart,
  titleEmphasis,
  body,
  cta,
  href,
}: {
  block: HomepageBlockView;
  eyebrow: string;
  titleStart: string;
  titleEmphasis: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.88fr_1fr] lg:items-center">
      <div className="py-2 lg:py-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#9C6B63]">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-[family:var(--font-display)] text-[3rem] leading-[0.95] text-[#2D1A16] sm:text-[4.3rem]">
          {titleStart} <em className="font-normal italic text-[#E0157A]">{titleEmphasis}</em>
        </h2>
        <p className="mt-5 max-w-[48ch] text-sm leading-7 text-[#9C6B63]">{body}</p>
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="mt-8 inline-flex min-h-12 items-center bg-[#E0157A] px-6 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#C0006A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0157A] focus-visible:ring-offset-2"
        >
          {cta}
        </a>
      </div>
      <SocialImage block={block} label={eyebrow} />
    </div>
  );
}

function TeamPanel() {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#9C6B63]">
        Csapatunk
      </p>
      <h2 className="mt-4 font-[family:var(--font-display)] text-[3rem] leading-[0.95] text-[#2D1A16] sm:text-[4.3rem]">
        Akik <em className="font-normal italic text-[#E0157A]">készítik.</em>
      </h2>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {teamMembers.map((member) => (
          <article key={`${member.name}-${member.role}`} className="group">
            <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.86),rgba(248,204,224,0.7)_42%,rgba(226,150,183,0.62)_100%)]">
              {member.imageUrl ? (
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <h3 className="mt-4 font-[family:var(--font-display)] text-[1.7rem] leading-none text-[#2D1A16]">
              {member.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#9C6B63]">{member.role}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function HomeInstagramPromo({ block }: HomeInstagramPromoProps) {
  const [activeTab, setActiveTab] = useState<SocialTab>("instagram");

  if (!block.isVisible) {
    return null;
  }

  return (
    <section className="bg-[#FDF0F6] px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-[#E8C9C0]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-0 pb-4 text-[11px] font-medium uppercase tracking-[0.32em] transition ${
                activeTab === tab.id
                  ? "border-[#E0157A] text-[#2D1A16]"
                  : "border-transparent text-[#9C6B63] hover:text-[#2D1A16]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-10">
          {activeTab === "instagram" ? (
            <SocialPanel
              block={block}
              eyebrow="Instagram"
              titleStart="@chicks"
              titleEmphasis="jewelry"
              body="Kulisszák, új kövek és viselési ötletek azoknak, akik szeretik közelről látni a részleteket."
              cta="Kövess Instagramon"
              href={block.buttonHref || "https://instagram.com/chicksjewelry"}
            />
          ) : null}
          {activeTab === "facebook" ? (
            <SocialPanel
              block={block}
              eyebrow="Facebook"
              titleStart="Chicks"
              titleEmphasis="Jewelry"
              body="Legyen részed a közösségben — újdonságok, visszajelzések és kulisszák egy helyen."
              cta="Kövess Facebookon"
              href="https://www.facebook.com/chicksjewelry"
            />
          ) : null}
          {activeTab === "team" ? <TeamPanel /> : null}
        </div>
      </div>
    </section>
  );
}
