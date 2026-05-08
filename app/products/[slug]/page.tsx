import { notFound } from "next/navigation"
import { ProductDetail } from "./product-detail"
import type { Product } from "@/lib/models/product"

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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const collectionSiblings = await getCollectionSiblings(product.collection, slug)

  return <ProductDetail product={product} related={collectionSiblings} />
}
