import Link from "next/link"
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
    <div>
      <Link href="/admin/products" className="admin-back">
        ← Back to catalogue
      </Link>
      <header className="admin-page-head">
        <div className="admin-page-head__lead">
          <p className="admin-eyebrow">Catalogue · Edit</p>
          <h1 className="admin-h1">
            {product.name}<span className="accent">.</span>
          </h1>
          <p className="admin-page-head__sub">
            {product.brand} · {product.category} · {product.collection}
            {product.featured && <span className="ml-3 text-foreground/85">★ Featured</span>}
          </p>
        </div>
      </header>
      <ProductForm product={product} />
    </div>
  )
}
