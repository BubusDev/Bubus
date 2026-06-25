"use client";

import Image from "next/image";
import { useState } from "react";

import type { HomepageBlockView } from "@/lib/homepage-content";
import type { SupportedLanguage } from "@/lib/international";

type HomeInstagramPromoProps = {
  block: HomepageBlockView;
  language: SupportedLanguage;
};

type SocialTab = "instagram" | "facebook" | "team";

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

const teamMembersEn: TeamMember[] = [
  { name: "Bubus", role: "Founder · Designer" },
  { name: "Team member", role: "Maker" },
  { name: "Team member", role: "Customer care" },
];

function localizedText(huValue: string, enValue: string | null | undefined, language: SupportedLanguage) {
  if (language !== "en") return huValue;
  return enValue?.trim() || huValue;
}

function localizedMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  language: SupportedLanguage,
  fallback: string,
) {
  const value = metadata[key];
  const enValue = metadata[`${key}En`];
  const baseValue = typeof value === "string" ? value : fallback;
  return localizedText(baseValue, typeof enValue === "string" ? enValue : null, language);
}

function readTeamMembers(block: HomepageBlockView, language: SupportedLanguage) {
  if (!Array.isArray(block.metadata.teamMembers)) {
    return language === "en" ? teamMembersEn : teamMembers;
  }

  const members = block.metadata.teamMembers
    .map((item): TeamMember | null => {
      if (!item || typeof item !== "object") return null;
      const value = item as Record<string, unknown>;
      return {
        name: localizedMetadataString(value, "name", language, ""),
        role: localizedMetadataString(value, "role", language, ""),
        imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : "",
      };
    })
    .filter((member): member is TeamMember => Boolean(member && (member.name || member.role)));

  return members.length > 0 ? members : language === "en" ? teamMembersEn : teamMembers;
}

function SocialImage({ block, label, language }: { block: HomepageBlockView; label: string; language: SupportedLanguage }) {
  const imageUrl =
    label === "Facebook" && typeof block.metadata.facebookImageUrl === "string"
      ? block.metadata.facebookImageUrl
      : block.imageUrl;
  const imageAlt = localizedText(block.imageAlt, block.imageAltEn, language);

  return (
    <div className="relative min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.82),rgba(248,204,224,0.72)_38%,rgba(226,150,183,0.72)_100%)] sm:min-h-[420px] lg:min-h-[500px]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt || label}
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
  language,
}: {
  block: HomepageBlockView;
  eyebrow: string;
  titleStart: string;
  titleEmphasis: string;
  body: string;
  cta: string;
  href: string;
  language: SupportedLanguage;
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
      <SocialImage block={block} label={eyebrow} language={language} />
    </div>
  );
}

function TeamPanel({ block, language }: { block: HomepageBlockView; language: SupportedLanguage }) {
  const members = readTeamMembers(block, language);
  const eyebrow = localizedMetadataString(block.metadata, "teamEyebrow", language, language === "en" ? "Team" : "Csapatunk");
  const titleStart = localizedMetadataString(block.metadata, "teamTitleStart", language, language === "en" ? "Made by" : "Akik");
  const titleEmphasis = localizedMetadataString(block.metadata, "teamTitleEmphasis", language, language === "en" ? "our team." : "készítik.");

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#9C6B63]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-[family:var(--font-display)] text-[3rem] leading-[0.95] text-[#2D1A16] sm:text-[4.3rem]">
        {titleStart} <em className="font-normal italic text-[#E0157A]">{titleEmphasis}</em>
      </h2>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {members.map((member) => (
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

export function HomeInstagramPromo({ block, language }: HomeInstagramPromoProps) {
  const [activeTab, setActiveTab] = useState<SocialTab>("instagram");
  const tabs: { id: SocialTab; label: string }[] = [
    {
      id: "instagram",
      label: localizedMetadataString(block.metadata, "instagramTabLabel", language, "Instagram"),
    },
    {
      id: "facebook",
      label: localizedMetadataString(block.metadata, "facebookTabLabel", language, "Facebook"),
    },
    {
      id: "team",
      label: localizedMetadataString(block.metadata, "teamTabLabel", language, language === "en" ? "Team" : "Csapatunk"),
    },
  ];
  const eyebrow = localizedText(block.eyebrow, block.eyebrowEn, language);
  const title = localizedText(block.title, block.titleEn, language);
  const body = localizedText(block.body, block.bodyEn, language);
  const buttonText = localizedText(block.buttonText, block.buttonTextEn, language);
  const facebookBody = localizedMetadataString(
    block.metadata,
    "facebookBody",
    language,
    language === "en"
      ? "Join the community for new pieces, feedback and behind-the-scenes notes."
      : "Legyen részed a közösségben - újdonságok, visszajelzések és kulisszák egy helyen.",
  );
  const facebookCta = localizedMetadataString(block.metadata, "facebookCta", language, language === "en" ? "Follow on Facebook" : "Kövess Facebookon");

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
              eyebrow={eyebrow || "Instagram"}
              titleStart={title || "@chicks"}
              titleEmphasis={title ? "" : "jewelry"}
              body={
                body ||
                (language === "en"
                  ? "Behind the scenes, new stones and styling ideas for people who love the details."
                  : "Kulisszák, új kövek és viselési ötletek azoknak, akik szeretik közelről látni a részleteket.")
              }
              cta={buttonText || (language === "en" ? "Follow on Instagram" : "Kövess Instagramon")}
              href={block.buttonHref || "https://instagram.com/chicksjewelry"}
              language={language}
            />
          ) : null}
          {activeTab === "facebook" ? (
            <SocialPanel
              block={block}
              eyebrow="Facebook"
              titleStart="Chicks"
              titleEmphasis="Jewelry"
              body={facebookBody}
              cta={facebookCta}
              href={
                typeof block.metadata.facebookHref === "string"
                  ? block.metadata.facebookHref
                  : "https://www.facebook.com/chicksjewelry"
              }
              language={language}
            />
          ) : null}
          {activeTab === "team" ? <TeamPanel block={block} language={language} /> : null}
        </div>
      </div>
    </section>
  );
}
