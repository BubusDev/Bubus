import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpecialEditionPage } from "@/components/shop/SpecialEditionPage";
import { getCategoryDefinition, getSpecialEditionCampaign } from "@/lib/products";
import { siteName } from "@/lib/site";

type SpecialEditionRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function SpecialEditionRoutePage({
  searchParams,
}: SpecialEditionRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryDefinition = await getCategoryDefinition("special-edition");
  const specialEditionCampaign = await getSpecialEditionCampaign();
  const categoryQuery = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        categoryQuery.append(key, entry);
      }
    } else if (value) {
      categoryQuery.set(key, value);
    }
  }

  const redirectTo = categoryQuery.toString()
    ? `/special-edition?${categoryQuery.toString()}`
    : "/special-edition";

  if (!categoryDefinition || !specialEditionCampaign?.isActive) {
    notFound();
  }

  return (
    <SpecialEditionPage
      category={categoryDefinition}
      bannerImageUrl={specialEditionCampaign.bannerImageUrl}
      bannerImageAlt={specialEditionCampaign.bannerImageAlt}
      entries={specialEditionCampaign.entries}
      redirectTo={redirectTo}
    />
  );
}
