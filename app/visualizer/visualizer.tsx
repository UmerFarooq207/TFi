"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronsLeft, ChevronsRight, Info, RotateCcw, Search, Sparkles, Star, Upload, X } from "lucide-react"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"

type Zone = "floor" | "wall"
type Mode = "designs" | "rooms"
type Tone = "all" | "light" | "mid" | "dark"

interface Scene {
  id: string
  name: string
  src: string
  floorHeight: number
  floorClipPath?: string
  wallHeight: number
}

const SCENES: Scene[] = [
  { id: "living-room-1", name: "Living Room I",  src: "/VisualizerImages/LivingRoom1.svg", floorHeight: 34, floorClipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)", wallHeight: 70 },
  { id: "living-room-2", name: "Living Room II", src: "/VisualizerImages/LivingRoom2.svg", floorHeight: 36, floorClipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)", wallHeight: 68 },
  { id: "bedroom-2",     name: "Bedroom",        src: "/VisualizerImages/BedRoom2.svg",    floorHeight: 30, floorClipPath: "polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)",  wallHeight: 74 },
  { id: "kitchen-1",     name: "Kitchen I",      src: "/VisualizerImages/Kitchen1.svg",    floorHeight: 24, floorClipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",  wallHeight: 80 },
  { id: "kitchen-2",     name: "Kitchen II",     src: "/VisualizerImages/Kitchen2.svg",    floorHeight: 24, floorClipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",  wallHeight: 80 },
]

interface Swatch {
  id: string
  name: string
  zone: Zone
  collection: string
  tone: Exclude<Tone, "all">
  isNew?: boolean
  texture: string
  thumb: string
  textureUrl?: string
  productSlug?: string
  price?: number
  unit?: string
}

const PRESETS: Swatch[] = [
  { id: "preset-floor-walnut",  name: "Walnut Plank",    zone: "floor", collection: "Heritage", tone: "dark",  isNew: true,  texture: "repeating-linear-gradient(95deg, #4b2e1f 0px, #5b3925 18px, #3e2519 30px, #5e3927 48px), linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0))", thumb: "repeating-linear-gradient(95deg, #4b2e1f 0px, #5b3925 14px, #3e2519 22px, #5e3927 36px)" },
  { id: "preset-floor-marble",  name: "Carrara Marble",  zone: "floor", collection: "Stone",    tone: "light",                texture: "radial-gradient(ellipse at 30% 20%, #f7f5f0 0%, #ddd6c8 60%, #c5bbad 100%), repeating-linear-gradient(120deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 24px)", thumb: "radial-gradient(ellipse at 30% 20%, #f7f5f0 0%, #ddd6c8 65%, #c5bbad 100%)" },
  { id: "preset-floor-oak",     name: "Heritage Oak",    zone: "floor", collection: "Heritage", tone: "mid",                  texture: "repeating-linear-gradient(92deg, #a37549 0px, #b88357 14px, #8c6037 26px, #b88357 42px), linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0))", thumb: "repeating-linear-gradient(92deg, #a37549 0px, #b88357 12px, #8c6037 22px, #b88357 36px)" },
  { id: "preset-floor-charcoal",name: "Charcoal Stone",  zone: "floor", collection: "Stone",    tone: "dark",  isNew: true,   texture: "radial-gradient(circle at 30% 30%, #3a3a3c 0%, #25272a 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 18px)", thumb: "radial-gradient(circle at 30% 30%, #3a3a3c 0%, #25272a 70%)" },
  { id: "preset-wall-clay",     name: "Warm Clay",       zone: "wall",  collection: "Plaster",  tone: "mid",                  texture: "linear-gradient(180deg, #c4a181, #b48b69)", thumb: "linear-gradient(180deg, #c4a181, #b48b69)" },
  { id: "preset-wall-bone",     name: "Bone Plaster",    zone: "wall",  collection: "Plaster",  tone: "light",                texture: "linear-gradient(180deg, #efe7d8, #d9cdb9)", thumb: "linear-gradient(180deg, #efe7d8, #d9cdb9)" },
  { id: "preset-wall-noir",     name: "Noir Slat",       zone: "wall",  collection: "Acoustic", tone: "dark",                 texture: "repeating-linear-gradient(90deg, #1c1816 0px, #1c1816 18px, #2a2421 18px, #2a2421 22px)", thumb: "repeating-linear-gradient(90deg, #1c1816 0px, #1c1816 14px, #2a2421 14px, #2a2421 18px)" },
  { id: "preset-wall-sage",     name: "Sage",            zone: "wall",  collection: "Plaster",  tone: "mid",   isNew: true,   texture: "linear-gradient(180deg, #8e9d83, #6e7d65)", thumb: "linear-gradient(180deg, #8e9d83, #6e7d65)" },
]

const DEFAULTS = {
  floor: PRESETS.find((p) => p.id === "preset-floor-oak") as Swatch,
  wall:  PRESETS.find((p) => p.id === "preset-wall-bone") as Swatch,
}

function buildProductSwatch(product: Product): Swatch | null {
  if (product.category === "kitchen") return null
  const zone: Zone = product.category === "flooring" ? "floor" : "wall"
  const url = toStoredImageUrl(product.images[0])
  return {
    id: `product-${String(product._id)}`,
    name: product.name,
    zone,
    collection: "Catalogue",
    tone: "mid",
    texture: `url("${url}") center/cover`,
    thumb: `url("${url}") center/cover`,
    textureUrl: url,
    productSlug: product.slug,
    price: product.price,
    unit: product.unit,
  }
}

export function Visualizer() {
  const [scene, setScene] = useState<Scene>(SCENES[0])
  const [products, setProducts] = useState<Product[]>([])
  const [floor, setFloor] = useState<Swatch>(DEFAULTS.floor)
  const wall = DEFAULTS.wall

  const [mode, setMode] = useState<Mode>("designs")
  const [collection, setCollection] = useState<string>("all")
  const [tone, setTone] = useState<Tone>("all")
  const [query, setQuery] = useState("")
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [railOpen, setRailOpen] = useState(true)

  const [roomFile, setRoomFile] = useState<File | null>(null)
  const [roomPreviewUrl, setRoomPreviewUrl] = useState<string | null>(null)
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null)
  const [renderLoading, setRenderLoading] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [renderMs, setRenderMs] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const renderRequestId = useRef(0)

  useEffect(() => {
    if (!roomFile) {
      setRoomPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(roomFile)
    setRoomPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [roomFile])

  useEffect(() => {
    if (!roomFile || !floor.textureUrl) {
      setRenderedUrl(null)
      setRenderError(null)
      setRenderMs(null)
      return
    }

    const id = ++renderRequestId.current
    const controller = new AbortController()

    const run = async () => {
      setRenderLoading(true)
      setRenderError(null)
      try {
        const form = new FormData()
        form.set("room_image", roomFile)
        form.set("texture_url", floor.textureUrl!)
        form.set("target_surface", "floor")
        form.set("blend_strength", "0.85")
        form.set("preserve_lighting", "true")

        const res = await fetch("/api/visualize", {
          method: "POST",
          body: form,
          signal: controller.signal,
        })

        const data = await res.json().catch(() => null)
        if (id !== renderRequestId.current) return

        if (!res.ok) {
          const detail =
            (data && (data.detail || data.error)) || `Render failed (${res.status})`
          throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail))
        }

        if (!data?.rendered_image_base64) {
          throw new Error("Render response did not include an image")
        }

        setRenderedUrl(data.rendered_image_base64)
        setRenderMs(typeof data.processing_time_ms === "number" ? data.processing_time_ms : null)
      } catch (err) {
        if (id !== renderRequestId.current) return
        if (err instanceof DOMException && err.name === "AbortError") return
        setRenderedUrl(null)
        setRenderError(err instanceof Error ? err.message : "Render failed")
      } finally {
        if (id === renderRequestId.current) setRenderLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [roomFile, floor.id, floor.textureUrl])

  const handleRoomFile = (file: File | null) => {
    if (!file) {
      setRoomFile(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      setRenderError("Please choose an image file (JPG or PNG).")
      return
    }
    setRenderError(null)
    setRoomFile(file)
  }

  const clearRoomPhoto = () => {
    renderRequestId.current++
    setRoomFile(null)
    setRenderedUrl(null)
    setRenderError(null)
    setRenderMs(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setProducts(data.filter((p: Product) => p.category !== "kitchen"))
        }
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  const productSwatches = useMemo(
    () => products.map(buildProductSwatch).filter((s): s is Swatch => s !== null),
    [products]
  )

  const allSwatches = useMemo(
    () => [...PRESETS, ...productSwatches].filter((s) => s.zone === "floor"),
    [productSwatches]
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
    setFloor(DEFAULTS.floor)
  }

  const cycleScene = (dir: 1 | -1) => {
    const i = SCENES.findIndex((s) => s.id === scene.id)
    const next = (i + dir + SCENES.length) % SCENES.length
    setScene(SCENES[next])
  }

  const toggleFav = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={`viz-shell${railOpen ? "" : " viz-shell--collapsed"}`}>
      {/* ============ STAGE ============ */}
      <section className="viz-stage">
        <div className="viz-stage__canvas">
          {roomPreviewUrl ? (
            <div className="viz-stage__photo" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={renderedUrl ?? roomPreviewUrl}
                alt={renderedUrl ? "AI-rendered preview of your room" : "Your room photo"}
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
          ) : (
            <>
              <div
                className="viz-stage__wall"
                style={{ height: `${scene.wallHeight}%`, background: wall.texture }}
                aria-hidden
              >
                <span className="viz-stage__wall-shade" aria-hidden />
              </div>

              <div
                className="viz-stage__floor"
                style={{
                  height: `${scene.floorHeight}%`,
                  background: floor.texture,
                  backgroundSize: floor.texture.includes("url(") ? "cover" : "auto, auto",
                  clipPath: scene.floorClipPath,
                }}
                aria-hidden
              >
                <span className="viz-stage__floor-shade" aria-hidden />
              </div>

              <div className="viz-stage__overlay" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={scene.src} alt={scene.name} />
              </div>
            </>
          )}

          <header className="viz-stage__brand">
            <span className="t-eyebrow">
              <span className="diamond">◆</span>TFi Visualizer
            </span>
            <h1 className="viz-stage__title">
              See it<br />in your space.
            </h1>
          </header>

          <div className="viz-stage__upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleRoomFile(e.target.files?.[0] ?? null)}
            />
            {roomPreviewUrl ? (
              <div className="viz-stage__upload-status">
                {renderedUrl ? (
                  <span className="viz-stage__chip viz-stage__chip--ok">
                    <Sparkles size={12} strokeWidth={1.8} />
                    AI render
                    {renderMs !== null && <em>{(renderMs / 1000).toFixed(1)}s</em>}
                  </span>
                ) : floor.textureUrl ? (
                  <span className="viz-stage__chip">Awaiting render…</span>
                ) : (
                  <span className="viz-stage__chip">
                    Pick a product finish to apply AI render
                  </span>
                )}
                <button
                  type="button"
                  className="viz-stage__upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} strokeWidth={1.7} /> Change photo
                </button>
                <button
                  type="button"
                  className="viz-stage__upload-btn viz-stage__upload-btn--ghost"
                  onClick={clearRoomPhoto}
                  aria-label="Remove uploaded photo"
                >
                  <X size={13} strokeWidth={1.7} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="viz-stage__upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} strokeWidth={1.7} /> Upload your room photo
              </button>
            )}
          </div>

          {!roomPreviewUrl && (
            <button
              type="button"
              className="viz-stage__nav"
              onClick={() => cycleScene(1)}
              aria-label="Next room"
            >
              <ChevronDown size={20} strokeWidth={1.6} />
            </button>
          )}

          <div className="viz-stage__scene-tag">
            <span className="lbl">{roomPreviewUrl ? "Source" : "Scene"}</span>
            <span className="val">{roomPreviewUrl ? "Your photo" : scene.name}</span>
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
        <nav className="viz-rail__tabs">
          <button
            type="button"
            onClick={() => setMode("designs")}
            className={mode === "designs" ? "is-active" : ""}
          >Designs</button>
          <button
            type="button"
            onClick={() => setMode("rooms")}
            className={mode === "rooms" ? "is-active" : ""}
          >Rooms</button>
          <button
            type="button"
            onClick={reset}
            className="viz-rail__tab-reset"
            aria-label="Reset selection"
          >
            <RotateCcw size={13} strokeWidth={1.6} /> Reset
          </button>
        </nav>

        {mode === "designs" ? (
          <>
            <div className="viz-rail__filters">
              <label className="viz-field">
                <span>Collection</span>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                >
                  {collections.map((c) => (
                    <option key={c} value={c}>{c === "all" ? "All collections" : c}</option>
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
              {filtered.length === 0 ? (
                <p className="viz-empty">No finishes match these filters.</p>
              ) : (
                <ul className="viz-grid">
                  {filtered.map((s) => {
                    const isActive = floor.id === s.id
                    const isFav = favourites.has(s.id)
                    return (
                      <li key={s.id} className={`viz-card${isActive ? " is-active" : ""}`}>
                        <button
                          type="button"
                          className="viz-card__media"
                          onClick={() => apply(s)}
                          aria-label={`Apply ${s.name}`}
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
                            <Star size={14} strokeWidth={1.6} fill={isFav ? "currentColor" : "none"} />
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
                  <span className="lbl">Selected floor</span>
                  <span className="val">{floor.name}</span>
                </div>
              </div>
              <Link href="/contact" className="tfi-pill viz-rail__cta">
                <span className="arrow">↳</span>Save selection
              </Link>
            </footer>
          </>
        ) : (
          <div className="viz-rooms">
            <p className="viz-rooms__hint">
              Switch the room to preview your selection in a different setting.
            </p>
            <ul className="viz-rooms__grid">
              {SCENES.map((s) => {
                const isActive = s.id === scene.id
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`viz-room${isActive ? " is-active" : ""}`}
                      onClick={() => setScene(s)}
                    >
                      <span className="viz-room__media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.src} alt="" />
                      </span>
                      <span className="viz-room__name">{s.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
