import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpecialEditionPage } from "@/components/shop/SpecialEditionPage";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getCategoryDefinition, getSpecialEditionCampaign } from "@/lib/products-server";
import { getRequestLocale } from "@/lib/request-locale";
import { siteName } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const categoryDefinition = await getCategoryDefinition("special-edition");

  if (!categoryDefinition) {
    return {};
  }
  const language = await getRequestLocale();
  const canonicalPath = getLocalizedPath(`/${categoryDefinition.slug}`, language);

  return {
    title: language === "en" ? `Limited pieces | ${siteName}` : `${categoryDefinition.title} | ${siteName}`,
    description: language === "en"
      ? "Limited Chicks Jewelry pieces in a curated seasonal edit."
      : categoryDefinition.seoDescription,
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages(`/${categoryDefinition.slug}`),
    },
  };
}

export default async function SpecialEditionRoutePage() {
  const categoryDefinition = await getCategoryDefinition("special-edition");
  const specialEditionCampaign = await getSpecialEditionCampaign();

  if (!categoryDefinition || !specialEditionCampaign?.isActive) {
    notFound();
  }

  return (
    <SpecialEditionPage
      entries={specialEditionCampaign.entries}
      bannerImageUrl={specialEditionCampaign.bannerImageUrl}
      bannerImageAlt={specialEditionCampaign.bannerImageAlt}
    />
  );
}
