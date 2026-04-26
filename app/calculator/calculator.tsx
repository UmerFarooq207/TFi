"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Calculator as CalcIcon, Ruler, Package, Sparkles, ShoppingBag, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCartStore } from "@/store/cart"
import { toStoredImageUrl } from "@/lib/image-url"
import { cn } from "@/lib/utils"
import type { Product, ProductCategory } from "@/lib/models/product"

const CATEGORY_OPTIONS: { value: ProductCategory; label: string; hint: string }[] = [
  { value: "flooring",      label: "Flooring",      hint: "Hardwood, marble, vinyl, ceramic" },
  { value: "wall-paneling", label: "Wall Paneling", hint: "Slat, 3D, fabric, stone veneer" },
  { value: "kitchen",       label: "Kitchen",       hint: "Cabinets, countertops, splash" },
]

export function Calculator() {
  const [length, setLength] = useState(12)
  const [width, setWidth] = useState(10)
  const [category, setCategory] = useState<ProductCategory>("flooring")
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [materialId, setMaterialId] = useState<string>("")
  const [wastage, setWastage] = useState<number[]>([10])
  const { addItem, toggleCart } = useCartStore()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setProductsLoading(true)
      try {
        const res = await fetch(`/api/products?category=${category}`)
        const data = await res.json()
        if (!cancelled) {
          const list = Array.isArray(data) ? data : []
          setProducts(list)
          setMaterialId((current) => {
            if (current && list.some((p: Product) => String(p._id) === current)) return current
            return list[0] ? String(list[0]._id) : ""
          })
        }
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [category])

  const area = useMemo(() => {
    const l = Number.isFinite(length) ? Math.max(0, length) : 0
    const w = Number.isFinite(width) ? Math.max(0, width) : 0
    return l * w
  }, [length, width])

  const wastagePct = wastage[0] ?? 0
  const adjustedArea = useMemo(() => area * (1 + wastagePct / 100), [area, wastagePct])

  const selectedProduct = useMemo(
    () => products.find((p) => String(p._id) === materialId) ?? null,
    [products, materialId]
  )

  const isPerUnit = selectedProduct?.unit?.toLowerCase().includes("unit")
  const baseQty = isPerUnit ? Math.max(1, Math.round(adjustedArea / 50) || 1) : adjustedArea
  const subtotal = selectedProduct ? selectedProduct.price * baseQty : 0
  const installEstimate = subtotal * 0.12
  const total = subtotal + installEstimate

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error("Pick a material first")
      return
    }
    const qty = isPerUnit ? Math.max(1, Math.round(baseQty)) : Math.max(1, Math.ceil(adjustedArea))
    addItem(selectedProduct, qty)
    toast.success(`${qty} ${selectedProduct.unit} added to cart`, {
      action: { label: "View Cart", onClick: () => toggleCart() },
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6 lg:gap-10">
      {/* Left: inputs */}
      <div className="space-y-8">
        {/* Step 1 — Dimensions */}
        <section className="border border-border/50 bg-card/40 backdrop-blur-sm p-6 lg:p-8 space-y-6">
          <StepHeader step="01" icon={Ruler} title="Room Dimensions" subtitle="Measure in feet" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              id="length"
              label="Length"
              value={length}
              onChange={setLength}
              suffix="ft"
            />
            <NumberField
              id="width"
              label="Width"
              value={width}
              onChange={setWidth}
              suffix="ft"
            />
          </div>
          <div className="flex items-baseline justify-between border-t border-border/40 pt-5">
            <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/60">
              Calculated Area
            </p>
            <p className="font-heading text-3xl font-medium text-foreground tabular-nums">
              {area.toLocaleString("en-PK")} <span className="text-sm text-muted-foreground/60 font-sans">sq ft</span>
            </p>
          </div>
        </section>

        {/* Step 2 — Product type */}
        <section className="border border-border/50 bg-card/40 backdrop-blur-sm p-6 lg:p-8 space-y-6">
          <StepHeader step="02" icon={Package} title="Product Type" subtitle="What are you specifying?" />
          <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
            <SelectTrigger className="h-12 w-full border-input bg-input/30 text-sm text-foreground rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex flex-col items-start">
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground/70">{opt.hint}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Step 3 — Material */}
        <section className="border border-border/50 bg-card/40 backdrop-blur-sm p-6 lg:p-8 space-y-6">
          <StepHeader
            step="03"
            icon={Sparkles}
            title="Material"
            subtitle="Pick from our catalogue"
          />
          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-6 text-center border border-dashed border-border/40">
              No materials available for this category yet.
            </p>
          ) : (
            <RadioGroup value={materialId} onValueChange={setMaterialId} className="gap-3">
              {products.map((product) => {
                const id = String(product._id)
                const checked = id === materialId
                return (
                  <Label
                    key={id}
                    htmlFor={`material-${id}`}
                    className={cn(
                      "flex items-center gap-4 border p-3 cursor-pointer transition-all",
                      checked
                        ? "border-accent bg-accent/5"
                        : "border-border/40 hover:border-border bg-background/40"
                    )}
                  >
                    <RadioGroupItem id={`material-${id}`} value={id} className="shrink-0" />
                    <div className="relative w-14 h-14 bg-secondary overflow-hidden shrink-0">
                      {product.images[0] && (
                        <Image
                          src={toStoredImageUrl(product.images[0])}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{product.name}</p>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/60">
                        {product.subcategory}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        PKR {product.price.toLocaleString("en-PK")}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">{product.unit}</p>
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>
          )}
        </section>

        {/* Step 4 — Wastage slider */}
        <section className="border border-border/50 bg-card/40 backdrop-blur-sm p-6 lg:p-8 space-y-6">
          <StepHeader
            step="04"
            icon={CalcIcon}
            title="Quantity Adjustment"
            subtitle="Add a wastage / cut allowance"
          />
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground/70">
                Wastage allowance
              </span>
              <span className="font-heading text-3xl font-medium text-foreground tabular-nums">
                +{wastagePct}%
              </span>
            </div>
            <Slider
              value={wastage}
              onValueChange={setWastage}
              min={0}
              max={30}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">
              <span>0%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between border-t border-border/40 pt-5">
            <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/60">
              {isPerUnit ? "Estimated units" : "Adjusted Area"}
            </p>
            <p className="font-heading text-2xl font-medium text-foreground tabular-nums">
              {isPerUnit
                ? Math.max(1, Math.round(baseQty))
                : adjustedArea.toLocaleString("en-PK", { maximumFractionDigits: 1 })}{" "}
              <span className="text-xs text-muted-foreground/60 font-sans">
                {selectedProduct?.unit ?? (isPerUnit ? "units" : "sq ft")}
              </span>
            </p>
          </div>
        </section>
      </div>

      {/* Right: live summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-border/60 bg-card/60 backdrop-blur-md">
          <div className="px-6 py-5 border-b border-border/40">
            <p className="text-[10px] tracking-[0.3em] uppercase text-accent">Estimate</p>
            <h2 className="font-heading text-xl font-medium text-foreground mt-1">
              Live Quote
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Selected material */}
            {selectedProduct ? (
              <div className="flex items-center gap-3 p-3 border border-border/40">
                <div className="relative w-12 h-12 bg-secondary overflow-hidden shrink-0">
                  {selectedProduct.images[0] && (
                    <Image
                      src={toStoredImageUrl(selectedProduct.images[0])}
                      alt={selectedProduct.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{selectedProduct.name}</p>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/60">
                    {selectedProduct.subcategory}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">
                Choose a material to see pricing.
              </p>
            )}

            {/* Breakdown */}
            <dl className="space-y-3 text-xs">
              <Row label="Room area" value={`${area.toLocaleString("en-PK")} sq ft`} />
              <Row label="Wastage allowance" value={`+${wastagePct}%`} />
              <Row
                label={isPerUnit ? "Estimated units" : "Order quantity"}
                value={`${
                  isPerUnit
                    ? Math.max(1, Math.round(baseQty))
                    : adjustedArea.toLocaleString("en-PK", { maximumFractionDigits: 1 })
                } ${selectedProduct?.unit ?? "sq ft"}`}
              />
              <div className="border-t border-border/30 pt-3 space-y-3">
                <Row
                  label="Materials"
                  value={`PKR ${subtotal.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`}
                />
                <Row
                  label="Installation est. (12%)"
                  value={`PKR ${installEstimate.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`}
                  muted
                />
              </div>
            </dl>

            {/* Total */}
            <div className="border border-accent/40 bg-accent/5 px-4 py-4 flex items-baseline justify-between">
              <span className="text-[10px] tracking-[0.28em] uppercase text-accent">
                Total Estimate
              </span>
              <span className="font-heading text-2xl font-medium text-foreground tabular-nums">
                PKR {total.toLocaleString("en-PK", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
              Estimate excludes site visit, custom finishes, and taxes. Final quote is
              confirmed on consultation.
            </p>

            <div className="space-y-2 pt-1">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedProduct}
                className="w-full h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 disabled:opacity-50"
              >
                <ShoppingBag size={14} className="mr-2" /> Add to Cart
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 text-xs tracking-[0.2em] uppercase border-border/60"
              >
                <Link href="/contact">
                  Request Detailed Quote
                  <ArrowRight size={12} className="ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Link
          href="/visualizer"
          className="mt-4 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors px-1"
        >
          <span>Preview in Visualizer</span>
          <ArrowRight size={12} />
        </Link>
      </aside>
    </div>
  )
}

function StepHeader({
  step,
  icon: Icon,
  title,
  subtitle,
}: {
  step: string
  icon: typeof CalcIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-mono">
        {step}
      </span>
      <span className="h-px flex-1 bg-border/40" />
      <span className="flex items-center gap-2 text-foreground">
        <Icon size={14} className="text-muted-foreground/70" />
        <span className="font-heading text-base font-medium">{title}</span>
      </span>
      <span className="hidden sm:inline text-[10px] text-muted-foreground/50">
        {subtitle}
      </span>
    </div>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string
  label: string
  value: number
  onChange: (n: number) => void
  suffix?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const next = parseFloat(e.target.value)
            onChange(Number.isFinite(next) ? next : 0)
          }}
          className="h-12 pr-12 text-base tabular-nums"
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className={cn("tabular-nums", muted ? "text-muted-foreground/70" : "text-foreground")}>
        {value}
      </dd>
    </div>
  )
}
