"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ChevronsLeft,
  ChevronsRight,
  Info,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"
import {
  VISUALIZER_ROOMS,
  publicRoomUrl,
  type VisualizerRoom,
} from "@/lib/visualizer-rooms"
import { API_ERROR_MESSAGE } from "@/lib/api-errors"

type Tone = "all" | "light" | "mid" | "dark"

interface Swatch {
  id: string
  name: string
  collection: string
  tone: Exclude<Tone, "all">
  isNew?: boolean
  thumb: string
  textureUrl: string
  productSlug?: string
  price?: number
  unit?: string
}

function buildProductSwatch(product: Product): Swatch | null {
  if (product.category !== "flooring") return null
  const firstImage = product.images[0]
  if (!firstImage) return null
  const url = toStoredImageUrl(firstImage)
  return {
    id: `product-${String(product._id)}`,
    name: product.name,
    collection: product.collection || "Catalogue",
    tone: "mid",
    thumb: `url("${url}") center/cover`,
    textureUrl: url,
    productSlug: product.slug,
    price: product.price,
    unit: product.unit,
  }
}

export function Visualizer() {
  const [products, setProducts] = useState<Product[]>([])
  const [floor, setFloor] = useState<Swatch | null>(null)
  const [room, setRoom] = useState<VisualizerRoom>(VISUALIZER_ROOMS[0])

  const [collection, setCollection] = useState<string>("all")
  const [tone, setTone] = useState<Tone>("all")
  const [query, setQuery] = useState("")
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [railOpen, setRailOpen] = useState(true)

  const [renderedUrl, setRenderedUrl] = useState<string | null>(null)
  const [renderedKey, setRenderedKey] = useState<string | null>(null)
  const [renderLoading, setRenderLoading] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [renderMs, setRenderMs] = useState<number | null>(null)
  const renderRequestId = useRef(0)
  const renderAbortRef = useRef<AbortController | null>(null)
  const renderInFlightRef = useRef(false)

  const roomPreviewUrl = publicRoomUrl(room)
  const currentKey = floor?.textureUrl ? `${room.id}:${floor.id}` : null
  const isStale = renderedUrl !== null && renderedKey !== currentKey

  useEffect(() => {
    if (!isStale) return
    renderAbortRef.current?.abort()
    renderRequestId.current++
    setRenderedUrl(null)
    setRenderedKey(null)
    setRenderError(null)
    setRenderMs(null)
    setRenderLoading(false)
  }, [isStale])

  const runRender = useCallback(async () => {
    if (!floor?.textureUrl) return
    // Synchronous re-entry guard: button's `disabled` only takes effect on the
    // next render, so a fast double-click can otherwise post twice.
    if (renderInFlightRef.current) return
    renderInFlightRef.current = true
    renderAbortRef.current?.abort()
    const controller = new AbortController()
    renderAbortRef.current = controller
    const id = ++renderRequestId.current
    const key = `${room.id}:${floor.id}`

    setRenderLoading(true)
    setRenderError(null)
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          flooring_id: floor.id,
          texture_url: floor.textureUrl,
        }),
        signal: controller.signal,
      })

      const data = await res.json().catch(() => null)
      if (id !== renderRequestId.current) return

      if (!res.ok) {
        throw new Error(API_ERROR_MESSAGE)
      }

      if (!data?.rendered_image_url) {
        throw new Error(API_ERROR_MESSAGE)
      }

      setRenderedUrl(data.rendered_image_url)
      setRenderedKey(key)
      setRenderMs(
        typeof data.processing_time_ms === "number" ? data.processing_time_ms : null
      )
    } catch (err) {
      if (id !== renderRequestId.current) return
      if (err instanceof DOMException && err.name === "AbortError") return
      setRenderedUrl(null)
      setRenderedKey(null)
      setRenderError(API_ERROR_MESSAGE)
    } finally {
      if (id === renderRequestId.current) setRenderLoading(false)
      renderInFlightRef.current = false
    }
  }, [room, floor])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setProducts(data)
        }
      } catch {}
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const allSwatches = useMemo(
    () => products.map(buildProductSwatch).filter((s): s is Swatch => s !== null),
    [products]
  )

  const collections = useMemo(() => {
    const set = new Set<string>()
    allSwatches.forEach((s) => set.add(s.collection))
    return ["all", ...Array.from(set)]
  }, [allSwatches])

  const filtered = useMemo(() => {
    return allSwatches.filter((s) => {
      if (collection !== "all" && s.collection !== collection) return false
      if (tone !== "all" && s.tone !== tone) return false
      if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [allSwatches, collection, tone, query])

  const apply = (swatch: Swatch) => {
    setFloor(swatch)
  }

  const reset = () => {
    setFloor(null)
  }

  const toggleFav = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const canRender = Boolean(floor?.textureUrl) && !renderLoading

  return (
    <div className={`viz-shell${railOpen ? "" : " viz-shell--collapsed"}`}>
      {/* ============ STAGE ============ */}
      <section className="viz-stage">
        <div className="viz-stage__canvas">
          <div className="viz-stage__photo" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={renderedUrl ?? roomPreviewUrl}
              alt={
                renderedUrl
                  ? `AI-rendered preview of ${room.name}`
                  : `${room.name} preview`
              }
            />
            {renderLoading && (
              <div className="viz-stage__loading" role="status" aria-live="polite">
                <span className="viz-stage__spinner" aria-hidden />
                <span>Generating AI preview…</span>
              </div>
            )}
            {renderError && !renderLoading && (
              <div className="viz-stage__alert" role="alert">
                {renderError}
              </div>
            )}
          </div>

          <header className="viz-stage__brand">
            <span className="t-eyebrow">
              <span className="diamond">◆</span>TFi Visualizer
            </span>
            <h1 className="viz-stage__title">
              Preview Flooring<br />in Your Room.
            </h1>
          </header>

          <div className="viz-stage__upload">
            <div className="viz-stage__upload-status">
              {renderLoading ? (
                <span className="viz-stage__chip">
                  Generating with {floor?.name ?? "your selection"}…
                </span>
              ) : renderedUrl ? (
                <span className="viz-stage__chip viz-stage__chip--ok">
                  <Sparkles size={12} strokeWidth={1.8} />
                  AI render
                  {renderMs !== null && <em>{(renderMs / 1000).toFixed(1)}s</em>}
                </span>
              ) : floor?.textureUrl ? (
                <span className="viz-stage__chip">Ready — click Visualize</span>
              ) : (
                <span className="viz-stage__chip">
                  Pick a flooring to apply AI render
                </span>
              )}
              <button
                type="button"
                className="viz-stage__upload-btn viz-stage__upload-btn--primary"
                onClick={runRender}
                disabled={!canRender}
              >
                <Wand2 size={13} strokeWidth={1.7} />
                {renderLoading ? "Visualizing…" : "Visualize"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="viz-stage__compare"
        onClick={() => setRailOpen((v) => !v)}
        aria-label={railOpen ? "Collapse panel" : "Expand panel"}
        aria-expanded={railOpen}
      >
        {railOpen ? (
          <ChevronsRight size={16} strokeWidth={1.6} />
        ) : (
          <ChevronsLeft size={16} strokeWidth={1.6} />
        )}
        <span>{railOpen ? "Collapse" : "Expand"}</span>
      </button>

      {/* ============ RAIL ============ */}
      <aside className="viz-rail">
        <section className="viz-rail__rooms" aria-label="Rooms">
          <div className="viz-rail__rooms-head">
            <span className="viz-rail__tab-label">Rooms</span>
          </div>
          <ul
            className="viz-rail__rooms-grid"
            role="radiogroup"
            aria-label="Preset rooms"
          >
            {VISUALIZER_ROOMS.map((r) => {
              const isActive = r.id === room.id
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`viz-rail__room-btn${isActive ? " is-active" : ""}`}
                    onClick={() => setRoom(r)}
                    title={r.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={publicRoomUrl(r)} alt="" loading="lazy" />
                    <span className="viz-rail__room-label">{r.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <nav className="viz-rail__tabs">
          <span className="viz-rail__tab-label">Flooring designs</span>
          <button
            type="button"
            onClick={reset}
            className="viz-rail__tab-reset"
            aria-label="Reset selection"
          >
            <RotateCcw size={13} strokeWidth={1.6} /> Reset
          </button>
        </nav>

        <div className="viz-rail__filters">
          <label className="viz-field">
            <span>Collection</span>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
            >
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All collections" : c}
                </option>
              ))}
            </select>
          </label>
          <label className="viz-field">
            <span>Tonality</span>
            <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
              <option value="all">All tones</option>
              <option value="light">Light</option>
              <option value="mid">Mid</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="viz-field viz-field--search">
            <span>Search</span>
            <div className="viz-field__search-wrap">
              <Search size={13} strokeWidth={1.8} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a finish…"
              />
            </div>
          </label>
        </div>

        <div className="viz-rail__grid-wrap">
          {allSwatches.length === 0 ? (
            <p className="viz-empty">
              No flooring products in the catalogue yet. Add one in the admin panel to use the AI visualizer.
            </p>
          ) : filtered.length === 0 ? (
            <p className="viz-empty">No finishes match these filters.</p>
          ) : (
            <ul className="viz-grid">
              {filtered.map((s) => {
                const isActive = floor?.id === s.id
                const isFav = favourites.has(s.id)
                return (
                  <li key={s.id} className={`viz-card${isActive ? " is-active" : ""}`}>
                    <button
                      type="button"
                      className="viz-card__media"
                      onClick={() => apply(s)}
                      aria-label={`Select ${s.name}`}
                    >
                      <span
                        className="viz-card__thumb"
                        style={{ background: s.thumb }}
                        aria-hidden
                      />
                      {s.isNew && <span className="viz-card__badge">New</span>}
                      {s.productSlug && (
                        <Link
                          href={`/products/${s.productSlug}`}
                          className="viz-card__info"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`More about ${s.name}`}
                        >
                          <Info size={13} strokeWidth={1.7} />
                        </Link>
                      )}
                    </button>
                    <div className="viz-card__foot">
                      <div className="viz-card__name">
                        <span className="viz-card__cat">Floor</span>
                        <span>{s.name}</span>
                      </div>
                      <button
                        type="button"
                        className={`viz-card__fav${isFav ? " is-on" : ""}`}
                        onClick={() => toggleFav(s.id)}
                        aria-label={isFav ? "Remove favourite" : "Add to favourites"}
                      >
                        <Star
                          size={14}
                          strokeWidth={1.6}
                          fill={isFav ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="viz-rail__foot">
          <div className="viz-summary">
            <div>
              <span className="lbl">Selected room</span>
              <span className="val">{room.name}</span>
            </div>
            <div>
              <span className="lbl">Selected floor</span>
              <span className="val">{floor?.name ?? "None"}</span>
            </div>
          </div>
          <Link href="/contact" className="tfi-pill viz-rail__cta">
            <span className="arrow">↳</span>Save selection
          </Link>
        </footer>
      </aside>
    </div>
  )
}
