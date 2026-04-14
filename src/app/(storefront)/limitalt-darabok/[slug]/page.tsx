import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LimitedEditionDetailPage } from "@/components/shop/LimitedEditionDetailPage";
import { getSpecialEditionCampaign } from "@/lib/products";
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

  return {
    title: `${entry.product.name} | Limitált kiadás | ${siteName}`,
    description: entry.product.shortDescription,
    alternates: {
      canonical: `/limitalt-darabok/${slug}`,
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
