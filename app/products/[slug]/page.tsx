import { notFound } from "next/navigation"
import { ProductDetail } from "./product-detail"
import type { Product } from "@/lib/models/product"

async function getProduct(slug: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/products/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

async function getRelated(category: string, excludeSlug: string): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/products?category=${category}`, { cache: "no-store" })
  if (!res.ok) return []
  const products: Product[] = await res.json()
  return products.filter((p) => p.slug !== excludeSlug).slice(0, 3)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelated(product.category, slug)

  return <ProductDetail product={product} related={related} />
}
