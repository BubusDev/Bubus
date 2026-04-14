import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpecialEditionPage } from "@/components/shop/SpecialEditionPage";
import { getCategoryDefinition, getSpecialEditionCampaign } from "@/lib/products";
import { siteName } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const categoryDefinition = await getCategoryDefinition("special-edition");

  if (!categoryDefinition) {
    return {};
  }

  return {
    title: `${categoryDefinition.title} | ${siteName}`,
    description: categoryDefinition.seoDescription,
    alternates: {
      canonical: `/${categoryDefinition.slug}`,
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
