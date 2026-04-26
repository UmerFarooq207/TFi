"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { RotateCcw, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"

type Zone = "floor" | "wall"

interface Scene {
  id: string
  name: string
  src: string
  /** Percentage of canvas height occupied by the floor (from bottom). */
  floorHeight: number
  /** clip-path polygon for floor — percentages of the floor zone box. */
  floorClipPath?: string
  /** Percentage of canvas height occupied by the wall (from top). */
  wallHeight: number
}

const SCENES: Scene[] = [
  {
    id: "living-room-1",
    name: "Living Room I",
    src: "/VisualizerImages/LivingRoom1.svg",
    floorHeight: 34,
    floorClipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)",
    wallHeight: 70,
  },
  {
    id: "living-room-2",
    name: "Living Room II",
    src: "/VisualizerImages/LivingRoom2.svg",
    floorHeight: 36,
    floorClipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
    wallHeight: 68,
  },
  {
    id: "bedroom-2",
    name: "Bedroom",
    src: "/VisualizerImages/BedRoom2.svg",
    floorHeight: 30,
    floorClipPath: "polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)",
    wallHeight: 74,
  },
  {
    id: "kitchen-1",
    name: "Kitchen I",
    src: "/VisualizerImages/Kitchen1.svg",
    floorHeight: 24,
    floorClipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",
    wallHeight: 80,
  },
  {
    id: "kitchen-2",
    name: "Kitchen II",
    src: "/VisualizerImages/Kitchen2.svg",
    floorHeight: 24,
    floorClipPath: "polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)",
    wallHeight: 80,
  },
]

interface Swatch {
  id: string
  name: string
  zone: Zone
  texture: string
  thumb: string
  productSlug?: string
  price?: number
  unit?: string
}

const PRESETS: Swatch[] = [
  {
    id: "preset-floor-walnut",
    name: "Walnut Plank",
    zone: "floor",
    texture:
      "repeating-linear-gradient(95deg, #4b2e1f 0px, #5b3925 18px, #3e2519 30px, #5e3927 48px), linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0))",
    thumb:
      "repeating-linear-gradient(95deg, #4b2e1f 0px, #5b3925 14px, #3e2519 22px, #5e3927 36px)",
  },
  {
    id: "preset-floor-marble",
    name: "Carrara Marble",
    zone: "floor",
    texture:
      "radial-gradient(ellipse at 30% 20%, #f7f5f0 0%, #ddd6c8 60%, #c5bbad 100%), repeating-linear-gradient(120deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 24px)",
    thumb:
      "radial-gradient(ellipse at 30% 20%, #f7f5f0 0%, #ddd6c8 65%, #c5bbad 100%)",
  },
  {
    id: "preset-floor-oak",
    name: "Heritage Oak",
    zone: "floor",
    texture:
      "repeating-linear-gradient(92deg, #a37549 0px, #b88357 14px, #8c6037 26px, #b88357 42px), linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0))",
    thumb:
      "repeating-linear-gradient(92deg, #a37549 0px, #b88357 12px, #8c6037 22px, #b88357 36px)",
  },
  {
    id: "preset-floor-charcoal",
    name: "Charcoal Stone",
    zone: "floor",
    texture:
      "radial-gradient(circle at 30% 30%, #3a3a3c 0%, #25272a 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 18px)",
    thumb: "radial-gradient(circle at 30% 30%, #3a3a3c 0%, #25272a 70%)",
  },
  {
    id: "preset-wall-clay",
    name: "Warm Clay",
    zone: "wall",
    texture: "linear-gradient(180deg, #c4a181, #b48b69)",
    thumb: "linear-gradient(180deg, #c4a181, #b48b69)",
  },
  {
    id: "preset-wall-bone",
    name: "Bone Plaster",
    zone: "wall",
    texture: "linear-gradient(180deg, #efe7d8, #d9cdb9)",
    thumb: "linear-gradient(180deg, #efe7d8, #d9cdb9)",
  },
  {
    id: "preset-wall-noir",
    name: "Noir Slat",
    zone: "wall",
    texture:
      "repeating-linear-gradient(90deg, #1c1816 0px, #1c1816 18px, #2a2421 18px, #2a2421 22px)",
    thumb:
      "repeating-linear-gradient(90deg, #1c1816 0px, #1c1816 14px, #2a2421 14px, #2a2421 18px)",
  },
  {
    id: "preset-wall-sage",
    name: "Sage",
    zone: "wall",
    texture: "linear-gradient(180deg, #8e9d83, #6e7d65)",
    thumb: "linear-gradient(180deg, #8e9d83, #6e7d65)",
  },
]

const DEFAULTS = {
  floor: PRESETS.find((p) => p.id === "preset-floor-oak") as Swatch,
  wall: PRESETS.find((p) => p.id === "preset-wall-bone") as Swatch,
}

function buildProductSwatch(product: Product): Swatch | null {
  if (product.category === "kitchen") return null
  const zone: Zone = product.category === "flooring" ? "floor" : "wall"
  const url = toStoredImageUrl(product.images[0])
  return {
    id: `product-${String(product._id)}`,
    name: product.name,
    zone,
    texture: `url("${url}") center/cover`,
    thumb: `url("${url}") center/cover`,
    productSlug: product.slug,
    price: product.price,
    unit: product.unit,
  }
}

function extractUrl(value: string): string | null {
  const match = value.match(/url\(["']?([^"')]+)["']?\)/)
  return match ? match[1] : null
}

export function Visualizer() {
  const [scene, setScene] = useState<Scene>(SCENES[0])
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [activeZone, setActiveZone] = useState<Zone>("floor")
  const [floor, setFloor] = useState<Swatch>(DEFAULTS.floor)
  const [wall, setWall] = useState<Swatch>(DEFAULTS.wall)
  const [customWallColor, setCustomWallColor] = useState("#d9cdb9")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setProducts(data.filter((p: Product) => p.category !== "kitchen"))
        }
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const productSwatches = useMemo(() => {
    return products
      .map(buildProductSwatch)
      .filter((s): s is Swatch => s !== null)
  }, [products])

  const presetFloors = PRESETS.filter((p) => p.zone === "floor")
  const presetWalls = PRESETS.filter((p) => p.zone === "wall")
  const productFloors = productSwatches.filter((s) => s.zone === "floor")
  const productWalls = productSwatches.filter((s) => s.zone === "wall")

  const apply = (swatch: Swatch) => {
    if (swatch.zone === "floor") setFloor(swatch)
    else setWall(swatch)
    setActiveZone(swatch.zone)
  }

  const reset = () => {
    setFloor(DEFAULTS.floor)
    setWall(DEFAULTS.wall)
  }

  const handleCustomWallColor = (color: string) => {
    setCustomWallColor(color)
    setWall({
      id: "custom-wall",
      name: "Custom paint",
      zone: "wall",
      texture: color,
      thumb: color,
    })
    setActiveZone("wall")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10">
      {/* Room canvas */}
      <div className="space-y-4">
        {/* Scene picker */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {SCENES.map((s) => {
            const active = s.id === scene.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScene(s)}
                className={cn(
                  "shrink-0 group relative overflow-hidden border transition-all",
                  active
                    ? "border-accent ring-2 ring-accent/40"
                    : "border-border/50 hover:border-border"
                )}
                aria-label={`Switch to ${s.name}`}
              >
                <div className="w-32 h-20 bg-[#efe7d8] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                </div>
                <span
                  className={cn(
                    "block text-[9px] tracking-[0.18em] uppercase text-center py-1.5 transition-colors",
                    active ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground"
                  )}
                >
                  {s.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Layered room */}
        <div
          className="relative w-full overflow-hidden border border-border/50 aspect-[16/8] select-none bg-[#efe7d8]"
        >
          {/* Wall layer (full canvas) */}
          <button
            type="button"
            onClick={() => setActiveZone("wall")}
            aria-label="Select wall zone"
            className={cn(
              "absolute inset-x-0 top-0 cursor-pointer transition-shadow",
              activeZone === "wall" && "ring-2 ring-accent ring-inset"
            )}
            style={{ height: `${scene.wallHeight}%`, background: wall.texture }}
          >
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.18), transparent 70%), linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.25))",
              }}
            />
          </button>

          {/* Floor layer (bottom slice with perspective trapezoid clip) */}
          <button
            type="button"
            onClick={() => setActiveZone("floor")}
            aria-label="Select floor zone"
            className={cn(
              "absolute inset-x-0 bottom-0 cursor-pointer transition-shadow",
              activeZone === "floor" && "ring-2 ring-accent ring-inset"
            )}
            style={{
              height: `${scene.floorHeight}%`,
              background: floor.texture,
              backgroundSize:
                floor.texture.includes("url(") ? "cover" : "auto, auto",
              clipPath: scene.floorClipPath,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.2) 100%)",
              }}
            />
          </button>

          {/* Room SVG ink overlay */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scene.src}
              alt={scene.name}
              className="w-full h-full object-cover"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Active zone label */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/40 px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase text-foreground z-10">
            Editing: <span className="text-accent">{activeZone}</span>
          </div>
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-border/40 px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase text-muted-foreground z-10">
            {scene.name}
          </div>
        </div>

        {/* Selection summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectionCard label="Floor" swatch={floor} />
          <SelectionCard label="Wall" swatch={wall} />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="text-xs tracking-[0.18em] uppercase border-border/60"
          >
            <RotateCcw size={12} className="mr-2" /> Reset
          </Button>
          <p className="text-xs text-muted-foreground/70">
            Click on a zone in the room or pick from below to begin styling.
          </p>
        </div>
      </div>

      {/* Swatch panel */}
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
        <Tabs value={activeZone} onValueChange={(v) => setActiveZone(v as Zone)}>
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="floor" className="text-xs flex-1">
              Flooring
            </TabsTrigger>
            <TabsTrigger value="wall" className="text-xs flex-1">
              Wall
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeZone === "floor" ? (
          <SwatchSection
            title="Curated Textures"
            swatches={presetFloors}
            active={floor.id}
            onPick={apply}
          />
        ) : (
          <SwatchSection
            title="Curated Finishes"
            swatches={presetWalls}
            active={wall.id}
            onPick={apply}
          />
        )}

        {activeZone === "wall" && (
          <div className="border border-border/50 p-4 space-y-3">
            <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Custom paint
            </p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customWallColor}
                onChange={(e) => handleCustomWallColor(e.target.value)}
                className="h-10 w-14 cursor-pointer border border-border/60 bg-transparent p-1"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {customWallColor.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">
            From the catalogue
          </p>
          {productsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          ) : (
            <SwatchSection
              compact
              swatches={activeZone === "floor" ? productFloors : productWalls}
              active={activeZone === "floor" ? floor.id : wall.id}
              onPick={apply}
              emptyHint={`No ${activeZone === "floor" ? "flooring" : "wall paneling"} products yet.`}
            />
          )}
        </div>
      </aside>
    </div>
  )
}

function SelectionCard({ label, swatch }: { label: string; swatch: Swatch }) {
  return (
    <div className="border border-border/40 p-3 flex items-center gap-3 bg-background/40">
      <div
        className="w-12 h-12 border border-border/40 shrink-0"
        style={{ background: swatch.thumb }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground/60">
          {label}
        </p>
        <p className="text-sm text-foreground truncate">{swatch.name}</p>
        {swatch.price !== undefined && swatch.unit && (
          <p className="text-[10px] text-muted-foreground">
            PKR {swatch.price.toLocaleString("en-PK")} {swatch.unit}
          </p>
        )}
      </div>
      {swatch.productSlug && (
        <Link
          href={`/products/${swatch.productSlug}`}
          className="text-[10px] tracking-[0.18em] uppercase text-accent hover:underline shrink-0 inline-flex items-center gap-1"
        >
          View <ArrowRight size={10} />
        </Link>
      )}
    </div>
  )
}

function SwatchSection({
  title,
  swatches,
  active,
  onPick,
  compact,
  emptyHint,
}: {
  title?: string
  swatches: Swatch[]
  active: string
  onPick: (s: Swatch) => void
  compact?: boolean
  emptyHint?: string
}) {
  if (swatches.length === 0 && emptyHint) {
    return <p className="text-xs text-muted-foreground/50 py-3">{emptyHint}</p>
  }
  return (
    <div className="space-y-3">
      {title && (
        <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">
          {title}
        </p>
      )}
      <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-4")}>
        {swatches.map((s) => {
          const isActive = s.id === active
          const url = extractUrl(s.thumb)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s)}
              className={cn(
                "relative aspect-square overflow-hidden border transition-all",
                isActive
                  ? "border-accent ring-2 ring-accent/40"
                  : "border-border/50 hover:border-border"
              )}
              aria-label={`Apply ${s.name}`}
              title={s.name}
            >
              {url ? (
                <Image src={url} alt={s.name} fill sizes="120px" className="object-cover" />
              ) : (
                <span
                  className="absolute inset-0"
                  style={{ background: s.thumb }}
                  aria-hidden
                />
              )}
              {isActive && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground rounded-full p-0.5">
                  <Check size={10} />
                </span>
              )}
              <span className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-background/85 backdrop-blur-sm text-[9px] tracking-wide text-foreground/90 truncate">
                {s.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
