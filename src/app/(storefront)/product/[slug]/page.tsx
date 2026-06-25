import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetailView } from "@/components/shop/ProductDetailView";
import {
  getAllProductSlugs,
  getCategoryDefinition,
  getRelatedProducts,
  resolveProductBySlug,
} from "@/lib/products-server";
import { getAbsoluteUrl, siteName } from "@/lib/site";
import { getLocalizedProduct } from "@/lib/i18n";
import { getAlternateLanguages, getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";

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
  const resolvedProduct = await resolveProductBySlug(slug);
  const product = resolvedProduct?.product;

  if (!product) {
    return {};
  }
  const language = await getRequestLocale();
  const localizedProduct = getLocalizedProduct(product, language);
  const canonicalPath = getLocalizedPath(`/product/${product.slug}`, language);

  return {
    title: `${localizedProduct.name} | ${siteName}`,
    description: localizedProduct.shortDescription,
    alternates: {
      canonical: canonicalPath,
      languages: getAlternateLanguages(`/product/${product.slug}`),
    },
    openGraph: {
      title: `${localizedProduct.name} | ${siteName}`,
      description: localizedProduct.shortDescription,
      type: "article",
      url: canonicalPath,
      images: [
        {
          url: `/product/${product.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${localizedProduct.name} | ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${localizedProduct.name} | ${siteName}`,
      description: localizedProduct.shortDescription,
      images: [`/product/${product.slug}/opengraph-image`],
    },
  };
}

function getSchemaAvailability(inStock: boolean) {
  return !inStock
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";
}

function formatCategoryLabel(category: string, language: "hu" | "en" = "hu") {
  switch (category) {
    case "necklaces":
      return language === "en" ? "Necklaces" : "Nyakláncok";
    case "bracelets":
      return language === "en" ? "Bracelets" : "Karkötők";
    case "special-edition":
      return language === "en" ? "Limited pieces" : "Limitált darabok";
    case "new-in":
      return language === "en" ? "New in" : "Újdonságok";
    case "sale":
      return language === "en" ? "Sale" : "Akció";
    default:
      return category;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const resolvedProduct = await resolveProductBySlug(slug);
  const product = resolvedProduct?.product;

  if (!product) {
    notFound();
  }

  if (resolvedProduct.redirectToSlug) {
    permanentRedirect(`/product/${resolvedProduct.redirectToSlug}`);
  }

  const [relatedProducts, categoryDefinition] = await Promise.all([
    getRelatedProducts(product),
    getCategoryDefinition(product.category),
  ]);

  const productUrl = getAbsoluteUrl(`/product/${product.slug}`);
  const productImage = product.imageUrl
    ? getAbsoluteUrl(product.imageUrl)
    : undefined;
  const language = await getRequestLocale();
  const categoryLabel = language === "en"
    ? formatCategoryLabel(product.category, language)
    : categoryDefinition?.title ?? formatCategoryLabel(product.category, language);
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
      priceCurrency: "HUF",
      availability: getSchemaAvailability(product.inStock),
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
