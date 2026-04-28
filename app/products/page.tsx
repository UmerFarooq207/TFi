"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"

type Category = "all" | "flooring" | "wall-paneling" | "kitchen"

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "flooring", label: "Floors" },
  { value: "wall-paneling", label: "Panels" },
  { value: "kitchen", label: "Surfaces" },
]

function ProductsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCat = (searchParams.get("category") as Category) || "all"

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>(initialCat)

  useEffect(() => {
    const cat = (searchParams.get("category") as Category) || "all"
    setCategory(cat)
  }, [searchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== "all") params.set("category", category)
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const setCat = (cat: Category, checked: boolean) => {
    if (checked) {
      router.push(`/products?category=${cat}`)
    } else {
      router.push(`/products`)
    }
  }

  const total = useMemo(() => products.length, [products])

  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>Collections
        </span>
        <Link href="/contact" className="tfi-link">↳ Get a quote</Link>
      </div>

      <section className="col-page">
        <h1 className="t-h2" style={{ maxWidth: 680, marginTop: 8 }}>
          {loading
            ? "Loading the collection."
            : `${total} ${total === 1 ? "finish" : "finishes"} across floors, panels, and surfaces — built for rooms that have to last.`}
        </h1>

        <div className="col-grid">
          <aside className="col-filters">
            <div className="col-filters__title">Filters</div>
            <div className="col-filters__count">{loading ? "…" : `${total} Results`}</div>

            <details className="col-filter" open>
              <summary>
                Category <span className="chev">▾</span>
              </summary>
              <div className="col-filter__opts">
                {CATEGORY_OPTIONS.map((c) => (
                  <label key={c.value}>
                    <input
                      type="checkbox"
                      checked={category === c.value}
                      onChange={(e) => setCat(c.value, e.target.checked)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </details>

            <details className="col-filter">
              <summary>Shade <span className="chev">▾</span></summary>
              <div className="col-filter__opts">
                <label><input type="checkbox" /> Light</label>
                <label><input type="checkbox" /> Mid</label>
                <label><input type="checkbox" /> Dark</label>
              </div>
            </details>
            <details className="col-filter">
              <summary>Wood effect <span className="chev">▾</span></summary>
              <div className="col-filter__opts">
                <label><input type="checkbox" /> Oak</label>
                <label><input type="checkbox" /> Walnut</label>
                <label><input type="checkbox" /> Ash</label>
              </div>
            </details>
            <details className="col-filter">
              <summary>Finish <span className="chev">▾</span></summary>
              <div className="col-filter__opts">
                <label><input type="checkbox" /> Matte</label>
                <label><input type="checkbox" /> Satin</label>
                <label><input type="checkbox" /> Brushed</label>
              </div>
            </details>
            <details className="col-filter">
              <summary>Format <span className="chev">▾</span></summary>
              <div className="col-filter__opts">
                <label><input type="checkbox" /> Plank</label>
                <label><input type="checkbox" /> Tile</label>
                <label><input type="checkbox" /> Sheet</label>
              </div>
            </details>
            <details className="col-filter">
              <summary>Thickness (mm) <span className="chev">▾</span></summary>
              <div className="col-filter__opts">
                <label><input type="checkbox" /> 8</label>
                <label><input type="checkbox" /> 10</label>
                <label><input type="checkbox" /> 12</label>
              </div>
            </details>
            <details className="col-filter">
              <summary>Collection <span className="chev">▾</span></summary>
              <div className="col-filter__opts">
                <label><input type="checkbox" /> Atelier</label>
                <label><input type="checkbox" /> Studio</label>
                <label><input type="checkbox" /> Trade</label>
              </div>
            </details>
          </aside>

          <div className="col-results">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-card" aria-hidden>
                  <div className="col-card__img" />
                  <div className="col-card__title">&nbsp;</div>
                  <div className="col-card__sub">&nbsp;</div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", padding: "60px 0", textAlign: "center", color: "var(--tfi-mute)" }}>
                <div className="t-h3" style={{ marginBottom: 8 }}>No products found.</div>
                <div>Try a different category.</div>
              </div>
            ) : (
              products.map((p) => {
                const sku = String(p._id ?? p.slug).slice(-4).toUpperCase()
                return (
                  <Link key={String(p._id)} href={`/products/${p.slug}`} className="col-card">
                    <div className="col-card__img">
                      {p.featured && <div className="col-card__new">NEW</div>}
                      <Image
                        src={toStoredImageUrl(p.images[0])}
                        alt={p.name}
                        fill
                        sizes="(max-width: 900px) 50vw, 30vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="col-card__title">
                      <span style={{ color: "var(--tfi-mute)", marginRight: 6 }}>{sku}</span>
                      {p.name}
                    </div>
                    <div className="col-card__sub">
                      <span>{p.subcategory}</span>
                      <span className="col-card__icons">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/></svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/></svg>
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <ProductsInner />
    </Suspense>
  )
}
