"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"
import type { Product } from "@/lib/models/product"

interface ProductDetailProps {
  product: Product
  related: Product[]
}

export function ProductDetail({ product, related }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const { addItem, toggleCart } = useCartStore()

  function handleAddToCart() {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`, {
      action: { label: "View Cart", onClick: toggleCart },
    })
  }

  const sku = String(product._id ?? product.slug).slice(-4).toUpperCase()
  const heroSrc = toStoredImageUrl(product.images[activeImage] ?? product.images[0])

  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>Product
        </span>
        <Link href="/contact" className="tfi-link">↳ Get a quote</Link>
      </div>

      <section className="pd">
        <div className="pd__grid">
          <div>
            <div className="pd__main" style={{ position: "relative" }}>
              <Image
                src={heroSrc}
                alt={product.name}
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className="pd__thumbs">
              {product.images.slice(0, 5).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  style={{ position: "relative" }}
                >
                  <Image
                    src={toStoredImageUrl(src)}
                    alt=""
                    fill
                    sizes="120px"
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1>
              <span style={{ color: "var(--tfi-mute)", marginRight: 8, fontSize: "0.65em" }}>
                {sku}
              </span>
              {product.name}
            </h1>
            <div className="pd__line">{product.subcategory}</div>
            <span className="pd__tag">
              {product.category === "flooring"
                ? "Studio XL"
                : product.category === "wall-paneling"
                  ? "Atelier"
                  : "Surfaces"}
            </span>

            <table className="pd__table">
              {product.specs.length > 0 ? (
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={i}>
                      <td>{spec.key}</td>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr><td>Category</td><td>{product.category.replace("-", " ")}</td></tr>
                  <tr><td>Subcategory</td><td>{product.subcategory}</td></tr>
                  <tr><td>Unit</td><td>{product.unit}</td></tr>
                  <tr><td>Warranty</td><td>Lifetime domestic · 15 yr commercial</td></tr>
                  <tr><td>Certificates</td><td>FSC · CARB2 · ECOLABEL</td></tr>
                </tbody>
              )}
            </table>

            <div className="pd__price">
              PKR {product.price.toLocaleString("en-PK")}
              <small>{product.unit ? `${product.unit} · ex. tax` : "ex. tax"}</small>
            </div>

            <div className="pd__actions">
              {product.inStock ? (
                <>
                  <div className="pd__qty">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
                  </div>
                  <button type="button" className="tfi-pill" onClick={handleAddToCart}>
                    <span className="arrow">↳</span>Add to cart
                  </button>
                  <Link href="/calculator" className="tfi-pill tfi-pill--outline">
                    <span className="arrow">↳</span>Estimate
                  </Link>
                </>
              ) : (
                <div style={{
                  padding: "10px 18px",
                  border: "1px solid var(--tfi-line)",
                  borderRadius: "9999px",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--tfi-mute)",
                }}>
                  Out of stock
                </div>
              )}
            </div>

            <div className="pd__icons">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/></svg>
              <Link href="/contact" className="pd__dist" style={{ marginLeft: "auto", textDecoration: "none" }}>
                ↳ Find distributor
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 96 }}>
            <span className="t-eyebrow" style={{ display: "block", marginBottom: 24, color: "var(--tfi-mute)" }}>
              <span className="diamond">◆</span>You may also like
            </span>
            <div className="col-results">
              {related.map((p) => {
                const rsku = String(p._id ?? p.slug).slice(-4).toUpperCase()
                return (
                  <Link key={String(p._id)} href={`/products/${p.slug}`} className="col-card">
                    <div className="col-card__img">
                      <Image
                        src={toStoredImageUrl(p.images[0])}
                        alt={p.name}
                        fill
                        sizes="(max-width: 900px) 50vw, 30vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="col-card__title">
                      <span style={{ color: "var(--tfi-mute)", marginRight: 6 }}>{rsku}</span>
                      {p.name}
                    </div>
                    <div className="col-card__sub">
                      <span>{p.subcategory}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
