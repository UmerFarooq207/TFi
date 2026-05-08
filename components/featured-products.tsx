import Link from "next/link"
import Image from "next/image"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { toStoredImageUrl } from "@/lib/image-url"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"

const fmtPrice = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { db } = await connectToDatabase()
    const products = await db
      .collection<Product>("products")
      .find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray()
    return products.map((p) => ({ ...p, _id: String(p._id) }))
  } catch {
    return []
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  flooring: "Floors",
  "wall-paneling": "Panels",
  kitchen: "Kitchen",
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()
  if (products.length === 0) return null

  return (
    <section className="products" data-screen-label="03 Products">
      <div className="tfi-section-eyebrow" style={{ margin: "0 0 12px", padding: 0 }}>
        <Reveal>
          <span className="t-eyebrow">
            <span className="diamond">◆</span>Featured
          </span>
        </Reveal>
      </div>
      <div className="products__head">
        <h2>
          <Reveal><span>Pieces you can hold,</span></Reveal>
          <br />
          <Reveal delay={0.08}><span>order, and have on site.</span></Reveal>
        </h2>
        <FadeUp delay={0.2}>
          <Link href="/products" className="tfi-pill">
            <span className="arrow">↳</span>View all products
          </Link>
        </FadeUp>
      </div>

      <StaggerGroup className="product-grid" stagger={0.06}>
        {products.map((p) => (
          <StaggerItem key={String(p._id)}>
            <Link href={`/products/${p.slug}`} className="p-card">
              <div className="p-card__media">
                <span className="p-card__badge">Featured</span>
                <Image
                  src={toStoredImageUrl(p.images[0] ?? "")}
                  alt={p.name}
                  fill
                  sizes="(max-width: 540px) 50vw, (max-width: 1100px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="p-card__body">
                <span className="p-card__cat">
                  {p.brand} · {p.collection}
                </span>
                <span className="p-card__title">{p.name}</span>
                <span className="p-card__row">
                  <span className="p-card__price">{fmtPrice(p.price)}</span>
                  {p.unit && (
                    <span className="p-card__price--old" style={{ textDecoration: "none" }}>
                      {p.unit}
                    </span>
                  )}
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}
