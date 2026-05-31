"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"
import { CollectionCarousel } from "@/components/collection-carousel"
import type { Product } from "@/lib/models/product"

interface ProductDetailProps {
  product: Product
  related: Product[]
  brandRelated: Product[]
}

type DimDisplay = "mm" | "in"

const MM_PER_INCH = 25.4
const DESCRIPTION_PREVIEW_CHARS = 240

function toMm(value: number, unit: Product["dimensions"]["unit"]): number {
  switch (unit) {
    case "mm": return value
    case "cm": return value * 10
    case "m":  return value * 1000
    case "in": return value * MM_PER_INCH
    default:   return value
  }
}

function fmtDim(valueMm: number, display: DimDisplay): string {
  if (display === "mm") return `${Math.round(valueMm)} mm`
  return `${(valueMm / MM_PER_INCH).toFixed(2)} in`
}

export function ProductDetail({ product, related, brandRelated }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [dimDisplay, setDimDisplay] = useState<DimDisplay>("mm")
  const [descExpanded, setDescExpanded] = useState(false)
  const galleryRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const { addItem, toggleCart } = useCartStore()

  function handleAddToCart() {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`, {
      action: { label: "View Cart", onClick: toggleCart },
    })
  }

  // ====== Description show-more logic ======
  const description = product.description ?? ""
  const isLongDesc = description.length > DESCRIPTION_PREVIEW_CHARS
  const visibleDesc = !isLongDesc || descExpanded
    ? description
    : description.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd() + "…"

  // ====== Collection colours (siblings only — excludes the selected colour) ======
  const collectionColors = useMemo(
    () => [...related].sort((a, b) => a.name.localeCompare(b.name)),
    [related]
  )

  // ====== Pill chips ======
  const pillChips = useMemo(() => {
    const out: string[] = []
    if (product.dimensions?.thickness) {
      out.push(`${Math.round(toMm(product.dimensions.thickness, product.dimensions.unit))}mm`)
    }
    if (product.pattern) out.push(product.pattern)
    if (product.color) out.push(product.color)
    for (const spec of product.specs ?? []) {
      if (spec.value) out.push(spec.value)
    }
    return out
  }, [product])

  // ====== Gallery scroll buttons ======
  useEffect(() => {
    const el = galleryRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [product.images.length])

  function scrollGallery(dir: 1 | -1) {
    const el = galleryRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" })
  }

  return (
    <>
      {/* ============ HERO BLOCK ============ */}
      <section className="pdv2-hero">
        <h2 className="pdv2-collection">{product.collection}</h2>
        <h1 className="pdv2-title">{product.name}</h1>

        {pillChips.length > 0 && (
          <div className="pdv2-pills">
            {pillChips.map((chip, i) => (
              <span key={`${chip}-${i}`} className="pdv2-pill">{chip}</span>
            ))}
          </div>
        )}

        {description && (
          <div className="pdv2-desc">
            <p>{visibleDesc}</p>
            {isLongDesc && (
              <button
                type="button"
                className="pdv2-desc__toggle"
                onClick={() => setDescExpanded((v) => !v)}
              >
                {descExpanded ? "SHOW LESS" : "SHOW MORE"}
                {descExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
        )}

        {/* ============ INLINE BUY BAND ============ */}
        <div className="pdv2-buy">
          <div className="pdv2-buy__price">
            <span className="pdv2-buy__amount">£{product.price.toLocaleString("en-GB")}</span>
            <span className="pdv2-buy__unit">{product.unit ? `${product.unit} · ex. tax` : "ex. tax"}</span>
          </div>
          <div className="pdv2-buy__actions">
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
                <Link href={`/calculator?product=${product.slug}`} className="tfi-pill tfi-pill--outline">
                  <span className="arrow">↳</span>Estimate
                </Link>
              </>
            ) : (
              <div className="pdv2-buy__oos">Out of stock</div>
            )}
          </div>
        </div>
      </section>

      {/* ============ GALLERY STRIP ============ */}
      {product.images.length > 0 && (
        <section className="pdv2-gallery">
          <div className="pdv2-gallery__track" ref={galleryRef}>
            {product.images.map((src, i) => (
              <div key={i} className="pdv2-gallery__slide">
                <Image
                  src={toStoredImageUrl(src)}
                  alt={`${product.name} — view ${i + 1}`}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
          {product.images.length > 1 && (
            <>
              <button
                type="button"
                className={`pdv2-gallery__nav pdv2-gallery__nav--left ${canScrollLeft ? "" : "is-disabled"}`}
                onClick={() => scrollGallery(-1)}
                aria-label="Previous image"
                disabled={!canScrollLeft}
              >
                <ArrowLeft size={16} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                className={`pdv2-gallery__nav pdv2-gallery__nav--right ${canScrollRight ? "" : "is-disabled"}`}
                onClick={() => scrollGallery(1)}
                aria-label="Next image"
                disabled={!canScrollRight}
              >
                <ArrowRight size={16} strokeWidth={1.6} />
              </button>
            </>
          )}
        </section>
      )}

      {/* ============ COLLECTION COLOURS ============ */}
      {collectionColors.length > 0 && (
        <CollectionCarousel
          products={collectionColors}
          secondary="color"
          title={`${product.collection} Colours`}
        />
      )}

      {/* ============ TECHNICAL SPECIFICATIONS ============ */}
      <section className="pdv2-tech">
        <h2 className="pdv2-tech__title">TECHNICAL SPECIFICATIONS</h2>

        {product.dimensions && (
          <div className="pd-spec__toggle">
            <span
              className={dimDisplay === "mm" ? "is-active" : ""}
              onClick={() => setDimDisplay("mm")}
              role="button"
              tabIndex={0}
            >
              MM
            </span>
            <button
              type="button"
              className={`pd-spec__switch ${dimDisplay === "in" ? "is-on" : ""}`}
              onClick={() => setDimDisplay((d) => (d === "mm" ? "in" : "mm"))}
              aria-label="Toggle units"
            >
              <span />
            </button>
            <span
              className={dimDisplay === "in" ? "is-active" : ""}
              onClick={() => setDimDisplay("in")}
              role="button"
              tabIndex={0}
            >
              IN
            </span>
          </div>
        )}

        {product.dimensions && (
          <div className="pd-spec__size">
            <p className="pd-spec__size-label">SIZE</p>
            <p className="pd-spec__size-value">
              {fmtDim(toMm(product.dimensions.width, product.dimensions.unit), dimDisplay)}
              <span> × </span>
              {fmtDim(toMm(product.dimensions.height, product.dimensions.unit), dimDisplay)}
            </p>
          </div>
        )}

        <div className="pd-spec__grid">
          {product.dimensions && (
            <>
              <div className="pd-spec__row">
                <p className="pd-spec__k">Width</p>
                <p className="pd-spec__v">{fmtDim(toMm(product.dimensions.width, product.dimensions.unit), dimDisplay)}</p>
              </div>
              <div className="pd-spec__row">
                <p className="pd-spec__k">Height</p>
                <p className="pd-spec__v">{fmtDim(toMm(product.dimensions.height, product.dimensions.unit), dimDisplay)}</p>
              </div>
              <div className="pd-spec__row">
                <p className="pd-spec__k">Thickness</p>
                <p className="pd-spec__v">{fmtDim(toMm(product.dimensions.thickness, product.dimensions.unit), dimDisplay)}</p>
              </div>
            </>
          )}

          {product.package && (
            <div className="pd-spec__row">
              <p className="pd-spec__k">Package</p>
              <p className="pd-spec__v">
                {product.package.unitsPerPackage} {product.package.unitLabel}
                {" / "}{product.package.areaPerPackage.toLocaleString("en-GB")} {product.package.areaUnit}
                {" / "}{product.package.weightPerPackage.toLocaleString("en-GB")} {product.package.weightUnit}
              </p>
            </div>
          )}

          {product.pallet && (
            <div className="pd-spec__row">
              <p className="pd-spec__k">Pallet</p>
              <p className="pd-spec__v">
                {product.pallet.unitsPerPallet} {product.pallet.unitLabel}
                {" / "}{product.pallet.areaPerPallet.toLocaleString("en-GB")} {product.pallet.areaUnit}
              </p>
            </div>
          )}

          {product.pattern && (
            <div className="pd-spec__row">
              <p className="pd-spec__k">Pattern</p>
              <p className="pd-spec__v">{product.pattern}</p>
            </div>
          )}

          {product.color && (
            <div className="pd-spec__row">
              <p className="pd-spec__k">Color</p>
              <p className="pd-spec__v">{product.color}</p>
            </div>
          )}

          {product.specs?.map((spec, i) => (
            <div key={i} className="pd-spec__row">
              <p className="pd-spec__k">{spec.key}</p>
              <p className="pd-spec__v">{spec.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ YOU MAY ALSO LIKE (same brand, other collections) ============ */}
      {brandRelated.length > 0 && (
        <CollectionCarousel
          products={brandRelated}
          title="You may also like…"
        />
      )}
    </>
  )
}
