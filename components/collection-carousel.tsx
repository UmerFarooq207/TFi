"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"

interface Props {
  products: Product[]
  currentSlug?: string
  title?: string
}

const fmtPrice = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

export function CollectionCarousel({ products, currentSlug, title = "You may also like…" }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateButtons = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateButtons()
    const el = trackRef.current
    if (!el) return
    el.addEventListener("scroll", updateButtons, { passive: true })
    window.addEventListener("resize", updateButtons)
    return () => {
      el.removeEventListener("scroll", updateButtons)
      window.removeEventListener("resize", updateButtons)
    }
  }, [products.length])

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-cc-card]")
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: "smooth" })
  }

  if (!products || products.length === 0) return null

  return (
    <section className="cc">
      <div className="cc__head">
        <h2 className="cc__title">{title}</h2>
      </div>

      <div className="cc__shell">
        <button
          type="button"
          className={`cc__nav cc__nav--left ${canScrollLeft ? "" : "is-disabled"}`}
          onClick={() => scrollByCard(-1)}
          aria-label="Previous"
          disabled={!canScrollLeft}
        >
          <ArrowLeft size={16} strokeWidth={1.6} />
        </button>

        <div className="cc__track" ref={trackRef}>
          {products.map((p) => {
            const isCurrent = currentSlug === p.slug
            return (
              <Link
                key={String(p._id ?? p.slug)}
                href={`/products/${p.slug}`}
                data-cc-card
                className={`cc__card ${isCurrent ? "is-current" : ""}`}
              >
                <div className="cc__media">
                  <Image
                    src={toStoredImageUrl(p.images[0] ?? "")}
                    alt={p.name}
                    fill
                    sizes="(max-width: 700px) 60vw, (max-width: 1200px) 28vw, 220px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="cc__body">
                  <p className="cc__name">{p.name}</p>
                  <p className="cc__price">
                    {fmtPrice(p.price)}
                    {p.unit && <span className="cc__unit"> / {p.unit}</span>}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <button
          type="button"
          className={`cc__nav cc__nav--right ${canScrollRight ? "" : "is-disabled"}`}
          onClick={() => scrollByCard(1)}
          aria-label="Next"
          disabled={!canScrollRight}
        >
          <ArrowRight size={16} strokeWidth={1.6} />
        </button>
      </div>
    </section>
  )
}
