"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart"
import type { Product } from "@/lib/models/product"

const fmt = (n: number) =>
  `PKR ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`

const WASTAGE_OPTIONS = [
  { value: 0.05, label: "+5% (straight lay)" },
  { value: 0.1,  label: "+10% (standard)" },
  { value: 0.15, label: "+15% (herringbone / cuts)" },
]

const UNDERLAY_OPTIONS = [
  { value: 0,   label: "None" },
  { value: 600, label: "Standard (PKR 600/m²)" },
  { value: 1200, label: "Acoustic (PKR 1,200/m²)" },
]

const FITTING_OPTIONS = [
  { value: 0,    label: "Supply only" },
  { value: 2200, label: "Supply + fit (PKR 2,200/m²)" },
  { value: 3400, label: "Supply + fit + finish (PKR 3,400/m²)" },
]

export function Calculator() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productId, setProductId] = useState<string>("")
  const [kind, setKind] = useState<"floor" | "wall">("floor")
  const [length, setLength] = useState(6)
  const [width, setWidth] = useState(4)
  const [wastage, setWastage] = useState(0.1)
  const [underlay, setUnderlay] = useState(600)
  const [fitting, setFitting] = useState(2200)
  const [postcode, setPostcode] = useState("")

  const { addItem, toggleCart } = useCartStore()

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
          if (list[0]) setProductId(String(list[0]._id))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const product = useMemo(
    () => products.find((p) => String(p._id) === productId) ?? null,
    [products, productId],
  )

  const area = Math.max(0, length) * Math.max(0, width)
  const matArea = area * (1 + wastage)
  const matCost = product ? matArea * product.price : 0
  const underCost = matArea * underlay
  const fitCost = area * fitting
  const total = matCost + underCost + fitCost

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
        <Link href="/contact" className="tfi-link">↳ Get a quote</Link>
      </div>

      <section className="est">
        <h1>Tell us the room. We&apos;ll tell you what it costs.</h1>
        <p style={{ color: "var(--tfi-mute)", marginTop: 14, maxWidth: 560 }}>
          Rough numbers, ex. tax. For a binding quotation, send the result to our trade team —
          we&apos;ll factor in subfloor, underlay, and fitting.
        </p>

        <div className="est__panel">
          <div className="est__row">
            <div className="est__field">
              <label htmlFor="prod">Product</label>
              <select
                id="prod"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={loading}
              >
                {loading && <option>Loading…</option>}
                {!loading && products.length === 0 && <option>No products available</option>}
                {products.map((p) => (
                  <option key={String(p._id)} value={String(p._id)}>
                    {p.name} — PKR {p.price}/{p.unit || "unit"}
                  </option>
                ))}
              </select>
            </div>
            <div className="est__field">
              <label htmlFor="kind">Surface type</label>
              <select id="kind" value={kind} onChange={(e) => setKind(e.target.value as "floor" | "wall")}>
                <option value="floor">Floor</option>
                <option value="wall">Wall panel</option>
              </select>
            </div>
          </div>

          <div className="est__row">
            <div className="est__field">
              <label htmlFor="len">Length (m)</label>
              <input
                id="len"
                type="number"
                min={0}
                step={0.1}
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="est__field">
              <label htmlFor="wid">Width (m)</label>
              <input
                id="wid"
                type="number"
                min={0}
                step={0.1}
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="est__row">
            <div className="est__field">
              <label htmlFor="waste">Wastage</label>
              <select id="waste" value={wastage} onChange={(e) => setWastage(parseFloat(e.target.value))}>
                {WASTAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="est__field">
              <label htmlFor="under">Underlay</label>
              <select id="under" value={underlay} onChange={(e) => setUnderlay(parseFloat(e.target.value))}>
                {UNDERLAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="est__row">
            <div className="est__field">
              <label htmlFor="fit">Fitting</label>
              <select id="fit" value={fitting} onChange={(e) => setFitting(parseFloat(e.target.value))}>
                {FITTING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="est__field">
              <label htmlFor="post">Postcode (delivery)</label>
              <input
                id="post"
                type="text"
                placeholder="e.g. 75600"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>
          </div>

          <div className="est__summary">
            <table>
              <tbody>
                <tr><td>Area</td><td>{area.toFixed(2)} m²</td></tr>
                <tr>
                  <td>Material (incl. wastage)</td>
                  <td>
                    {matArea.toFixed(2)} m² × PKR {product?.price ?? 0} = {fmt(matCost)}
                  </td>
                </tr>
                <tr><td>Underlay</td><td>{fmt(underCost)}</td></tr>
                <tr><td>Fitting</td><td>{fmt(fitCost)}</td></tr>
                <tr className="total"><td>Estimate</td><td>{fmt(total)}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="tfi-pill" onClick={handleAdd}>
              <span className="arrow">↳</span>Add to cart
            </button>
            <Link href="/contact" className="tfi-pill tfi-pill--outline">
              <span className="arrow">↳</span>Send to trade team
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
