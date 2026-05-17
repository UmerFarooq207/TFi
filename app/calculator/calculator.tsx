"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"
import { TfiCartButton } from "@/components/tfi-cart-button"
import { useCartStore } from "@/store/cart"
import type { Product } from "@/lib/models/product"
import {
  quoteDelivery,
  isValidUkPostcode,
  type DeliveryQuote,
} from "@/lib/delivery"

const fmt = (n: number) =>
  `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

const WASTAGE_OPTIONS = [
  { value: 0.05, label: "+5% (straight lay)" },
  { value: 0.1,  label: "+10% (standard)" },
  { value: 0.15, label: "+15% (herringbone / cuts)" },
]

const UNDERLAY_OPTIONS = [
  { value: 0,    label: "None" },
  { value: 600,  label: "Standard (£600/m²)" },
  { value: 1200, label: "Acoustic (£1,200/m²)" },
]

const FITTING_OPTIONS = [
  { value: 0,    label: "Supply only" },
  { value: 2200, label: "Supply + fit (£2,200/m²)" },
  { value: 3400, label: "Supply + fit + finish (£3,400/m²)" },
]

const STEPS = [
  {
    title: "Pick your material",
    copy: "Choose a floor, panel, or surface from the live catalogue. Pricing updates instantly.",
  },
  {
    title: "Tell us the room",
    copy: "Length × width in metres. We add wastage, underlay, and fitting based on the layout.",
  },
  {
    title: "Get a binding quote",
    copy: "Send the result to our trade team — we'll factor in the subfloor, access, and delivery.",
  },
]

const FAQS = [
  { q: "Is this estimate binding?",            a: "It's a quick guide. For a binding figure we'll review subfloor, prep, access, and delivery — usually within a working day." },
  { q: "What's wastage?",                      a: "An allowance for cuts, breaks, and pattern matching. 10% covers most rooms; herringbone and tile bias may need 15%." },
  { q: "Do you deliver outside Birmingham?",    a: "Yes — UK-wide for trade. Delivery is calculated by postcode and weight at checkout." },
  { q: "Can I add the result to my cart?",      a: "Yes. Hit Add to cart and we'll convert m² to packs based on the product unit, rounded up." },
]

export function Calculator() {
  const searchParams = useSearchParams()
  const presetSlug = searchParams.get("product")

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productId, setProductId] = useState<string>("")
  const [kind, setKind] = useState<string>("")
  const [length, setLength] = useState<string>("")
  const [width, setWidth] = useState<string>("")
  const [wastage, setWastage] = useState<string>("")
  const [underlay, setUnderlay] = useState<string>("")
  const [fitting, setFitting] = useState<string>("")
  const [postcode, setPostcode] = useState("")
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null)
  const [quotingDelivery, setQuotingDelivery] = useState(false)

  const { addItem, toggleCart } = useCartStore()

  // Debounced postcode → delivery fee lookup (postcodes.io)
  useEffect(() => {
    const trimmed = postcode.trim()
    if (!trimmed) {
      setDeliveryQuote(null)
      setQuotingDelivery(false)
      return
    }
    if (!isValidUkPostcode(trimmed)) {
      setDeliveryQuote(null)
      setQuotingDelivery(false)
      return
    }
    const controller = new AbortController()
    setQuotingDelivery(true)
    const t = setTimeout(async () => {
      try {
        const q = await quoteDelivery(trimmed, controller.signal)
        setDeliveryQuote(q)
      } finally {
        setQuotingDelivery(false)
      }
    }, 400)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [postcode])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        if (!cancelled) {
          const list = Array.isArray(data) ? data : []
          setProducts(list)
          // Only auto-select if user navigated here from a product page (?product=<slug>)
          if (presetSlug) {
            const match = list.find((p: Product) => p.slug === presetSlug)
            if (match) setProductId(String(match._id))
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [presetSlug])

  const product = useMemo(
    () => products.find((p) => String(p._id) === productId) ?? null,
    [products, productId],
  )

  const lengthN = parseFloat(length) || 0
  const widthN = parseFloat(width) || 0
  const wastageN = parseFloat(wastage) || 0
  const underlayN = parseFloat(underlay) || 0
  const fittingN = parseFloat(fitting) || 0

  const area = Math.max(0, lengthN) * Math.max(0, widthN)
  const matArea = area * (1 + wastageN)
  const matCost = product ? matArea * product.price : 0
  const underCost = matArea * underlayN
  const fitCost = area * fittingN
  const deliveryFee = deliveryQuote?.fee ?? 0
  const total = matCost + underCost + fitCost + deliveryFee

  const handleAdd = () => {
    if (!product) {
      toast.error("Pick a product first.")
      return
    }
    const qty = Math.max(1, Math.ceil(matArea))
    addItem(product, qty)
    toast.success(`${qty} ${product.unit || "units"} added to cart`, {
      action: { label: "View Cart", onClick: () => toggleCart() },
    })
  }

  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>Estimate calculator
        </span>
        <div className="tfi-topbar__right">
          <Link href="/contact" className="tfi-link">↳ Get a quote</Link>
          <TfiCartButton tone="ink" />
        </div>
      </div>

      {/* ============ HERO ============ */}
      <section className="est-hero">
        <FadeUp>
          <div className="est-hero__crumbs">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 10px", opacity: 0.6 }}>/</span>Estimate
          </div>
        </FadeUp>
        <h1 className="est-hero__title">
          <Reveal><span>Free Flooring &amp; Paneling</span></Reveal>
          <br />
          <Reveal delay={0.08}><span>Cost Estimate Calculator.</span></Reveal>
        </h1>
        <FadeUp delay={0.14}>
          <p className="est-hero__sub">
            Tell us the room and the material. We&apos;ll do the maths — area, wastage, underlay,
            fitting, and totals — and you can drop the result straight into your cart or send it
            to our trade team for a binding quote.
          </p>
        </FadeUp>
      </section>

      {/* ============ MAIN LAYOUT ============ */}
      <section className="est-layout">
        {/* Left: explanation, steps, trust */}
        <aside className="est-side">
          <FadeUp>
            <div className="est-side__eyebrow">How it works</div>
          </FadeUp>
          <h2 className="est-side__title">
            <Reveal><span>Three Simple Steps —</span></Reveal>
            <br />
            <Reveal delay={0.06}><span>No Sales Calls Required.</span></Reveal>
          </h2>

          <StaggerGroup className="est-steps" stagger={0.08}>
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="est-step">
                  <div className="est-step__num" aria-hidden>{i + 1}</div>
                  <div>
                    <div className="est-step__title">{s.title}</div>
                    <p className="est-step__copy">{s.copy}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <StaggerGroup className="est-trust" stagger={0.08}>
            <StaggerItem>
              <div>
                <div className="est-trust__num">&lt; 24h</div>
                <div className="est-trust__lbl">Trade team response time</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <div className="est-trust__num">15 yr</div>
                <div className="est-trust__lbl">Commercial warranty</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <div className="est-trust__num">FSC</div>
                <div className="est-trust__lbl">Certified timber sources</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <div className="est-trust__num">UK</div>
                <div className="est-trust__lbl">UK-wide delivery</div>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </aside>

        {/* Right: estimate card */}
        <FadeUp y={40}>
          <div className="est-card">
            <div className="est-card__head">
              <h2>Your Project Estimate</h2>
              <span className="est-card__hint">Live · updates as you type</span>
            </div>

            <div className="est-row-2">
              <div className="est-field">
                <label htmlFor="prod">Product</label>
                <select
                  id="prod"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={loading}
                >
                  <option value="" disabled>
                    {loading
                      ? "Loading…"
                      : products.length === 0
                        ? "No products available"
                        : "Select a product"}
                  </option>
                  {products.map((p) => (
                    <option key={String(p._id)} value={String(p._id)}>
                      {p.name} — £{p.price}/{p.unit || "unit"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="est-field">
                <label htmlFor="kind">Surface type</label>
                <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="" disabled>Select a surface</option>
                  <option value="floor">Floor</option>
                  <option value="wall">Wall panel</option>
                </select>
              </div>
            </div>

            <div className="est-row-2">
              <div className="est-field">
                <label htmlFor="len">Length (m)</label>
                <input
                  id="len"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  placeholder="e.g. 6"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </div>
              <div className="est-field">
                <label htmlFor="wid">Width (m)</label>
                <input
                  id="wid"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  placeholder="e.g. 4"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>
            </div>

            <div className="est-row-2">
              <div className="est-field">
                <label htmlFor="waste">Wastage</label>
                <select id="waste" value={wastage} onChange={(e) => setWastage(e.target.value)}>
                  <option value="" disabled>Select wastage</option>
                  {WASTAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="est-field">
                <label htmlFor="under">Underlay</label>
                <select id="under" value={underlay} onChange={(e) => setUnderlay(e.target.value)}>
                  <option value="" disabled>Select underlay</option>
                  {UNDERLAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="est-row-2">
              <div className="est-field">
                <label htmlFor="fit">Fitting</label>
                <select id="fit" value={fitting} onChange={(e) => setFitting(e.target.value)}>
                  <option value="" disabled>Select fitting</option>
                  {FITTING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="est-field">
                <label htmlFor="post">Postcode (delivery)</label>
                <input
                  id="post"
                  type="text"
                  placeholder="e.g. B42 1AD"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </div>
            </div>

            <div className="est-summary">
              <div className="est-summary__row">
                <span className="est-summary__label">Area</span>
                <span className="est-summary__value">{area.toFixed(2)} m²</span>
              </div>
              <div className="est-summary__row">
                <span className="est-summary__label">Material (incl. wastage)</span>
                <span className="est-summary__value">
                  {matArea.toFixed(2)} m² × £{product?.price ?? 0} = {fmt(matCost)}
                </span>
              </div>
              <div className="est-summary__row">
                <span className="est-summary__label">Underlay</span>
                <span className="est-summary__value">{fmt(underCost)}</span>
              </div>
              <div className="est-summary__row">
                <span className="est-summary__label">Fitting</span>
                <span className="est-summary__value">{fmt(fitCost)}</span>
              </div>
              <div className="est-summary__row">
                <span className="est-summary__label">Delivery</span>
                <span className="est-summary__value">
                  {!postcode.trim()
                    ? "Enter postcode"
                    : !isValidUkPostcode(postcode)
                      ? "Enter a valid UK postcode"
                      : quotingDelivery || !deliveryQuote
                        ? "Calculating…"
                        : `${fmt(deliveryQuote.fee)} · ${
                            deliveryQuote.band === "local"
                              ? "Birmingham (within 10 mi)"
                              : "UK-wide"
                          }`}
                </span>
              </div>
              <div className="est-summary__row est-summary__row--total">
                <span className="est-summary__label">Estimate</span>
                <span className="est-summary__value">{fmt(total)}</span>
              </div>
            </div>

            <div className="est-actions">
              <button type="button" className="tfi-pill" onClick={handleAdd}>
                <span className="arrow">↳</span>Add to cart
              </button>
              <Link href="/contact" className="tfi-pill tfi-pill--outline">
                <span className="arrow">↳</span>Send to trade team
              </Link>
            </div>
            {/* TODO: wire this estimate to a real backend submission (HubSpot/Formspree) */}
          </div>
        </FadeUp>
      </section>

      {/* ============ FAQ ============ */}
      <section className="est-faq">
        <FadeUp>
          <h2>Frequently Asked Questions About Our Estimates.</h2>
        </FadeUp>
        <StaggerGroup className="est-faq__grid" stagger={0.06}>
          {FAQS.map((f) => (
            <StaggerItem key={f.q}>
              <div className="est-faq__item">
                <h3 className="est-faq__q">{f.q}</h3>
                <p className="est-faq__a">{f.a}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  )
}
