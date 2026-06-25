import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LimitedEditionDetailPage } from "@/components/shop/LimitedEditionDetailPage";
import { getLocalizedProduct } from "@/lib/i18n";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getSpecialEditionCampaign } from "@/lib/products-server";
import { getRequestLocale } from "@/lib/request-locale";
import { siteName } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getSpecialEditionCampaign();
  const entry = campaign?.entries.find((e) => e.product.slug === slug);

  if (!entry) {
    return {};
  }
  const language = await getRequestLocale();
  const product = getLocalizedProduct(entry.product, language);
  const canonicalPath = getLocalizedPath(`/limitalt-darabok/${slug}`, language);

  return {
    title: `${product.name} | ${language === "en" ? "Limited edition" : "Limitált kiadás"} | ${siteName}`,
    description: product.shortDescription,
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages(`/limitalt-darabok/${slug}`),
    },
  };
}

export default async function LimitedEditionDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await getSpecialEditionCampaign();

  if (!campaign?.isActive) {
    notFound();
  }

  const entry = campaign.entries.find((e) => e.product.slug === slug);

  if (!entry) {
    notFound();
  }

  return <LimitedEditionDetailPage entry={entry} />;
}
