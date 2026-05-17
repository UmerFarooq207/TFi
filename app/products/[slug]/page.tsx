import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "./product-detail"
import type { Product } from "@/lib/models/product"
import { toStoredImageUrl } from "@/lib/image-url"

const SITE_URL = "https://www.tfifloorsandinteriors.co.uk"

const CATEGORY_LABEL: Record<Product["category"], string> = {
  flooring: "Flooring",
  "wall-paneling": "Wall Paneling",
  kitchen: "Kitchen",
}

async function getProduct(slug: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/products/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

async function getCollectionSiblings(collection: string, excludeSlug: string): Promise<Product[]> {
  if (!collection) return []
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/products?collection=${encodeURIComponent(collection)}`, { cache: "no-store" })
  if (!res.ok) return []
  const products: Product[] = await res.json()
  return products.filter((p) => p.slug !== excludeSlug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) {
    return {
      title: { absolute: "Product Not Found | TFi Floors and Interiors UK" },
      description: "This TFi Floors and Interiors product could not be found.",
      robots: { index: false, follow: false },
    }
  }

  const categoryLabel = CATEGORY_LABEL[product.category] ?? "Interiors"
  const title = `${product.name} | ${product.brand} ${categoryLabel} | TFi UK`
  const rawDescription = product.description?.replace(/\s+/g, " ").trim() ?? ""
  const description = rawDescription
    ? `${rawDescription.slice(0, 155)}${rawDescription.length > 155 ? "…" : ""}`
    : `Buy ${product.name} from TFi Floors and Interiors UK — ${product.brand} ${categoryLabel.toLowerCase()}, ${product.collection} collection. Premium quality, UK-wide delivery.`

  const ogImage = product.images?.[0] ? toStoredImageUrl(product.images[0]) : "/assets/TFI-nav-footer.png"

  const keywords = [
    product.name,
    product.brand,
    product.collection,
    `${product.brand} ${categoryLabel}`,
    `${product.collection} UK`,
    `${categoryLabel} UK`,
    product.color,
    product.pattern,
    "premium interior materials UK",
    "TFi Floors and Interiors",
  ].filter(Boolean) as string[]

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.slug}`,
      siteName: "TFi Floors and Interiors",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${product.name} — ${product.brand} ${categoryLabel.toLowerCase()} from TFi UK`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const collectionSiblings = await getCollectionSiblings(product.collection, slug)

  const categoryLabel = CATEGORY_LABEL[product.category] ?? "Interiors"
  const productImage = product.images?.[0] ? toStoredImageUrl(product.images[0]) : `${SITE_URL}/assets/TFI-nav-footer.png`
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: categoryLabel,
    image: productImage,
    sku: String(product._id ?? product.slug),
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "GBP",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
      seller: { "@type": "Organization", name: "TFi Floors and Interiors" },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetail product={product} related={collectionSiblings} />
    </>
  )
}
