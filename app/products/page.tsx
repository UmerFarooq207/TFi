"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { toast } from "sonner"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"
import { TfiCartButton } from "@/components/tfi-cart-button"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"
import type { Product } from "@/lib/models/product"

type Category =
  | "all"
  | "flooring"
  | "decorative-furniture-panel"
  | "skirting"
  | "decorative-wall-covering"
  | "furniture-profile"
type Sort = "featured" | "price-asc" | "price-desc" | "newest"

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "all",                        label: "All Categories" },
  { value: "flooring",                   label: "Flooring" },
  { value: "decorative-furniture-panel", label: "Decorative Furniture Panel" },
  { value: "skirting",                   label: "Laminate Flooring Accessories" },
  { value: "decorative-wall-covering",   label: "Decorative Wall Covering" },
  { value: "furniture-profile",          label: "Furniture Profile" },
]

const fmtPrice = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

const EASE = [0.22, 1, 0.36, 1] as const

function ProductsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reduce = useReducedMotion()
  const { addItem, toggleCart } = useCartStore()

  function addToCart(p: Product) {
    addItem(p, 1)
    toast.success(`${p.name} added to cart`, {
      action: { label: "View Cart", onClick: toggleCart },
    })
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState<string>(searchParams.get("brand") ?? "all")
  const [category, setCategory] = useState<Category>((searchParams.get("category") as Category) || "all")
  const [collection, setCollection] = useState<string>(searchParams.get("collection") ?? "all")
  const [color, setColor] = useState("all")
  const [pattern, setPattern] = useState("all")
  const [thickness, setThickness] = useState("all")
  const [stock, setStock] = useState<"all" | "in" | "out">("all")
  const [sort, setSort] = useState<Sort>("featured")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const resetSecondary = () => {
    setColor("all")
    setPattern("all")
    setThickness("all")
    setStock("all")
  }

  // Sync from URL when query string changes externally
  useEffect(() => {
    setBrand(searchParams.get("brand") ?? "all")
    setCategory((searchParams.get("category") as Category) || "all")
    setCollection(searchParams.get("collection") ?? "all")
  }, [searchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Lock body scroll while the mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [filtersOpen])

  // Cascading option lists
  const allBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(),
    [products]
  )
  const visibleByBrand = useMemo(
    () => (brand === "all" ? products : products.filter((p) => p.brand === brand)),
    [products, brand]
  )
  const visibleByBrandAndCat = useMemo(
    () => (category === "all" ? visibleByBrand : visibleByBrand.filter((p) => p.category === category)),
    [visibleByBrand, category]
  )
  const allCollections = useMemo(
    () => Array.from(new Set(visibleByBrandAndCat.map((p) => p.collection).filter(Boolean))).sort(),
    [visibleByBrandAndCat]
  )
  const allColors = useMemo(
    () => Array.from(new Set(visibleByBrandAndCat.map((p) => p.color).filter(Boolean))).sort(),
    [visibleByBrandAndCat]
  )
  const allPatterns = useMemo(
    () => Array.from(new Set(visibleByBrandAndCat.map((p) => p.pattern).filter(Boolean))).sort(),
    [visibleByBrandAndCat]
  )
  const allThicknesses = useMemo(() => {
    const set = new Set<string>()
    for (const p of visibleByBrandAndCat) {
      if (p.dimensions?.thickness) set.add(`${p.dimensions.thickness} ${p.dimensions.unit}`)
    }
    return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b))
  }, [visibleByBrandAndCat])

  // Collections shown in the slider — one representative image per collection
  const sliderCollections = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of visibleByBrandAndCat) {
      if (p.collection && !map.has(p.collection)) map.set(p.collection, p.images?.[0] ?? "")
    }
    return Array.from(map, ([name, image]) => ({ name, image }))
  }, [visibleByBrandAndCat])

  // Push filter state to URL
  const pushUrl = useCallback(
    (next: { brand?: string; category?: Category; collection?: string }) => {
      const params = new URLSearchParams()
      const b = next.brand ?? brand
      const c = next.category ?? category
      const col = next.collection ?? collection
      if (b !== "all") params.set("brand", b)
      if (c !== "all") params.set("category", c)
      if (col !== "all") params.set("collection", col)
      const qs = params.toString()
      router.push(qs ? `/products?${qs}` : "/products")
    },
    [brand, category, collection, router]
  )

  const setBrandFilter = (b: string) => {
    setBrand(b)
    setCollection("all")
    resetSecondary()
    pushUrl({ brand: b, collection: "all" })
  }
  const setCategoryFilter = (c: Category) => {
    setCategory(c)
    setCollection("all")
    resetSecondary()
    pushUrl({ category: c, collection: "all" })
  }
  const setCollectionFilter = (c: string) => {
    setCollection(c)
    pushUrl({ collection: c })
  }
  const clearFilters = () => {
    setBrand("all")
    setCategory("all")
    setCollection("all")
    resetSecondary()
    router.push("/products")
  }

  const filtered = useMemo(() => {
    return visibleByBrandAndCat.filter((p) => {
      if (collection !== "all" && p.collection !== collection) return false
      if (color !== "all" && p.color !== color) return false
      if (pattern !== "all" && p.pattern !== pattern) return false
      if (thickness !== "all" && `${p.dimensions?.thickness} ${p.dimensions?.unit}` !== thickness) return false
      if (stock === "in" && !p.inStock) return false
      if (stock === "out" && p.inStock) return false
      return true
    })
  }, [visibleByBrandAndCat, collection, color, pattern, thickness, stock])

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sort === "price-asc")  list.sort((a, b) => a.price - b.price)
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price)
    if (sort === "newest")     list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    return list
  }, [filtered, sort])

  const total = sorted.length
  const activeCount = [brand, category, collection, color, pattern, thickness, stock].filter(
    (v) => v !== "all"
  ).length
  const hasActiveFilter = activeCount > 0

  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>Products
        </span>
        <div className="tfi-topbar__right">
          <Link href="/contact" className="tfi-link">↳ Get a quote</Link>
          <TfiCartButton tone="ink" />
        </div>
      </div>

      {/* ============ HERO ============ */}
      <section className="col-hero">
        <FadeUp>
          <div className="col-hero__crumbs">
            <Link href="/">Home</Link><span className="sep">/</span>Products
          </div>
        </FadeUp>
        <h1 className="col-hero__title">
          <Reveal><span>Shop Premium Flooring </span></Reveal>
          <Reveal delay={0.06}><span>&amp; Wall Paneling.</span></Reveal>
        </h1>
        <FadeUp delay={0.12}>
          <p className="col-hero__sub">
            Shop premium engineered oak flooring, acoustic wall panels, microcement and stone
            surfaces. Browse by brand, narrow to a category, then drill into a single TFi
            collection — filter, sort and add to cart in one step.
          </p>
        </FadeUp>
      </section>

      {/* ============ COLLECTION SLIDER ============ */}
      {!loading && sliderCollections.length > 0 && (
        <section className="col-slider" aria-label="Browse collections">
          <div className="col-slider__track">
            {sliderCollections.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`col-slide${collection === c.name ? " is-active" : ""}`}
                onClick={() => setCollectionFilter(collection === c.name ? "all" : c.name)}
              >
                <div className="col-slide__media">
                  <Image src={toStoredImageUrl(c.image)} alt={c.name} fill sizes="300px" style={{ objectFit: "cover" }} />
                </div>
                <span className="col-slide__name">{c.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ============ FILTERS ============ */}
      <section className="col-filter-section">
        <button
          type="button"
          className="col-filter-toggle"
          onClick={() => setFiltersOpen(true)}
          aria-expanded={filtersOpen}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
          {activeCount > 0 && <span className="col-filter-toggle__count">{activeCount}</span>}
        </button>

        {filtersOpen && <div className="col-filter-backdrop" onClick={() => setFiltersOpen(false)} />}

        <div className={`col-filter-panel${filtersOpen ? " is-open" : ""}`}>
          <div className="col-filter-panel__head">
            <span>Filters</span>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">×</button>
          </div>
          <div className="col-filter-row">
          <FilterSelect
            label="Brand"
            value={brand}
            onChange={setBrandFilter}
            options={[{ value: "all", label: "All Brands" }, ...allBrands.map((b) => ({ value: b, label: b }))]}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={(v) => setCategoryFilter(v as Category)}
            options={CATEGORY_OPTIONS}
          />
          <FilterSelect
            label="Collection"
            value={collection}
            onChange={setCollectionFilter}
            disabled={allCollections.length === 0}
            options={[
              { value: "all", label: allCollections.length === 0 ? "No collections" : "All Collections" },
              ...allCollections.map((c) => ({ value: c, label: c })),
            ]}
          />
          <FilterSelect
            label="Color"
            value={color}
            onChange={setColor}
            disabled={allColors.length === 0}
            options={[
              { value: "all", label: allColors.length === 0 ? "No colours" : "All Colours" },
              ...allColors.map((c) => ({ value: c, label: c })),
            ]}
          />
          <FilterSelect
            label="Pattern"
            value={pattern}
            onChange={setPattern}
            disabled={allPatterns.length === 0}
            options={[
              { value: "all", label: allPatterns.length === 0 ? "No patterns" : "All Patterns" },
              ...allPatterns.map((p) => ({ value: p, label: p })),
            ]}
          />
          <FilterSelect
            label="Thickness"
            value={thickness}
            onChange={setThickness}
            disabled={allThicknesses.length === 0}
            options={[
              { value: "all", label: allThicknesses.length === 0 ? "No thickness" : "All Thicknesses" },
              ...allThicknesses.map((t) => ({ value: t, label: t })),
            ]}
          />
          <FilterSelect
            label="Availability"
            value={stock}
            onChange={(v) => setStock(v as "all" | "in" | "out")}
            options={[
              { value: "all", label: "All Stock" },
              { value: "in", label: "In Stock" },
              { value: "out", label: "Out of Stock" },
            ]}
          />
          </div>
          <button
            type="button"
            className="col-filter-panel__apply"
            onClick={() => setFiltersOpen(false)}
          >
            Show {total} {total === 1 ? "result" : "results"}
          </button>
        </div>

        {hasActiveFilter && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--tfi-mute)" }}>
              Active:
            </span>
            {brand !== "all" && <FilterChip label={brand} onClear={() => setBrandFilter("all")} />}
            {category !== "all" && (
              <FilterChip
                label={CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category}
                onClear={() => setCategoryFilter("all")}
              />
            )}
            {collection !== "all" && <FilterChip label={collection} onClear={() => setCollectionFilter("all")} />}
            {color !== "all" && <FilterChip label={color} onClear={() => setColor("all")} />}
            {pattern !== "all" && <FilterChip label={pattern} onClear={() => setPattern("all")} />}
            {thickness !== "all" && <FilterChip label={thickness} onClear={() => setThickness("all")} />}
            {stock !== "all" && (
              <FilterChip label={stock === "in" ? "In Stock" : "Out of Stock"} onClear={() => setStock("all")} />
            )}
            <button
              type="button"
              onClick={clearFilters}
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--tfi-ink)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                marginLeft: 4,
              }}
            >
              ↳ Clear all
            </button>
          </div>
        )}
      </section>

      {/* ============ TOOLBAR ============ */}
      <div className="col-toolbar">
        <div className="col-toolbar__count">
          <strong>{loading ? "…" : total}</strong> {total === 1 ? "result" : "results"}
        </div>
        <label className="col-toolbar__sort">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price · Low → High</option>
            <option value="price-desc">Price · High → Low</option>
          </select>
        </label>
      </div>

      {/* ============ GRID ============ */}
      <section className="col-page-v2">
        {loading ? (
          <div className="col-grid-v2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} aria-hidden>
                <div className="col-skeleton" />
                <div className="col-card-v2__body">
                  <span className="col-card-v2__cat" style={{ opacity: 0.4 }}>—</span>
                  <span className="col-card-v2__name" style={{ opacity: 0.4 }}>Loading product</span>
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="col-grid-v2">
            <div className="col-empty">
              <div className="col-empty__title">No products match these filters.</div>
              <div>Try a different brand, category, or collection.</div>
              <button type="button" className="tfi-pill" style={{ marginTop: 24 }} onClick={clearFilters}>
                <span className="arrow">↳</span>Clear filters
              </button>
            </div>
          </div>
        ) : (
          <StaggerGroup className="col-grid-v2" stagger={0.06} key={`grid-${brand}-${category}-${collection}-${color}-${pattern}-${thickness}-${stock}-${sort}`}>
              {sorted.map((p, idx) => {
                const Card = (
                  <div className="col-card-v2">
                    <Link href={`/products/${p.slug}`} className="col-card-v2__link">
                      <div className="col-card-v2__media">
                        {p.featured && <span className="col-card-v2__badge">Featured</span>}
                        <Image
                          src={toStoredImageUrl(p.images[0])}
                          alt={p.name}
                          fill
                          sizes="(max-width: 540px) 50vw, (max-width: 1100px) 33vw, 20vw"
                          style={{ objectFit: "cover" }}
                          priority={idx < 3}
                        />
                        <div className="col-card-v2__overlay">
                          <span className="col-card-v2__cta">
                            <span className="arrow">↳</span>View
                          </span>
                        </div>
                      </div>
                      <div className="col-card-v2__body">
                        <span className="col-card-v2__cat">{p.brand} · {p.collection}</span>
                        <span className="col-card-v2__name">{p.name}</span>
                        <span className="col-card-v2__price">
                          {fmtPrice(p.price)} {p.unit && <span style={{ color: "var(--tfi-mute)", fontWeight: 400 }}> / {p.unit}</span>}
                        </span>
                      </div>
                    </Link>
                    <div className="col-card-v2__actions">
                      <button type="button" className="p-card__btn p-card__btn--cart" onClick={() => addToCart(p)}>
                        Add to cart
                      </button>
                      <Link href={`/calculator?product=${p.slug}`} className="p-card__btn p-card__btn--est">
                        Estimate
                      </Link>
                    </div>
                  </div>
                )
                if (reduce) {
                  return <div key={String(p._id)}>{Card}</div>
                }
                return (
                  <StaggerItem key={String(p._id)} y={20}>
                    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.32, ease: EASE }}>
                      {Card}
                    </motion.div>
                  </StaggerItem>
                )
              })}
          </StaggerGroup>
        )}
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="col-cta">
        <FadeUp>
          <h2>Looking for a specific material or finish?</h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="col-cta__row">
            <Link href="/calculator" className="tfi-pill tfi-pill--light">
              <span className="arrow">↳</span>Estimate calculator
            </Link>
            <Link href="/contact" className="tfi-pill tfi-pill--ghost">
              <span className="arrow">↳</span>Talk to trade team
            </Link>
          </div>
        </FadeUp>
      </section>
    </>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--tfi-mute)",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "12px 14px",
          border: "1px solid var(--tfi-line)",
          background: "transparent",
          color: "var(--tfi-ink)",
          fontSize: 14,
          letterSpacing: "0.02em",
          appearance: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundImage: "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
          backgroundPosition: "calc(100% - 16px) calc(50% - 2px), calc(100% - 11px) calc(50% - 2px)",
          backgroundSize: "5px 5px, 5px 5px",
          backgroundRepeat: "no-repeat",
          paddingRight: 32,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px 5px 12px",
        background: "var(--tfi-ink)",
        color: "var(--tfi-cream)",
        fontSize: 11,
        letterSpacing: "0.06em",
      }}
    >
      {label}
      <button
        type="button"
        onClick={onClear}
        style={{
          background: "transparent",
          border: 0,
          color: "var(--tfi-cream)",
          fontSize: 14,
          lineHeight: 1,
          cursor: "pointer",
          padding: 0,
        }}
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <ProductsInner />
    </Suspense>
  )
}
