import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/shop/ProductDetailView";
import {
  getAllProductSlugs,
  getCategoryDefinition,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { getAbsoluteUrl, siteName } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.warn(
      "Skipping product static generation because the database is not configured or reachable.",
      error,
    );

    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | ${siteName}`,
    description: product.shortDescription,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description: product.shortDescription,
      type: "article",
      url: `/product/${product.slug}`,
      images: [
        {
          url: `/product/${product.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${product.name} | ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description: product.shortDescription,
      images: [`/product/${product.slug}/opengraph-image`],
    },
  };
}

function getSchemaAvailability(availability: string) {
  switch (availability) {
    case "in-stock":
      return "https://schema.org/InStock";
    case "out-of-stock":
      return "https://schema.org/OutOfStock";
    default:
      return "https://schema.org/InStock";
  }
}

function formatCategoryLabel(category: string) {
  switch (category) {
    case "necklaces":
      return "Nyakláncok";
    case "bracelets":
      return "Karkötők";
    case "special-edition":
      return "Limitált darabok";
    case "new-in":
      return "Újdonságok";
    case "sale":
      return "Akció";
    default:
      return category;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, categoryDefinition] = await Promise.all([
    getRelatedProducts(product),
    getCategoryDefinition(product.category),
  ]);

  const productUrl = getAbsoluteUrl(`/product/${product.slug}`);
  const productImage = product.imageUrl
    ? getAbsoluteUrl(product.imageUrl)
    : undefined;
  const categoryLabel = categoryDefinition?.title ?? formatCategoryLabel(product.category);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: productImage ? [productImage] : undefined,
    description: product.shortDescription,
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "EUR",
      availability: getSchemaAvailability(product.availability),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Főoldal",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: getAbsoluteUrl(`/${product.category}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailView
        product={product}
        categoryTitle={categoryLabel}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
