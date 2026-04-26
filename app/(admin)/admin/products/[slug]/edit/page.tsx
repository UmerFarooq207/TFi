import { notFound } from "next/navigation"
import { ProductForm } from "../../product-form"
import type { Product } from "@/lib/models/product"

async function getProduct(slug: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/products/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50 mb-1">
          Catalogue
        </p>
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Edit Product
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
