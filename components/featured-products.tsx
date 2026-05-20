import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"
import { FeaturedProductCard } from "@/components/featured-product-card"

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
            <FeaturedProductCard product={p} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}
