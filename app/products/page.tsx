"use client"

import { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { FadeIn } from "@/components/fade-in"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/models/product"

type Category = "all" | "flooring" | "wall-paneling" | "kitchen"

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "flooring", label: "Flooring" },
  { value: "wall-paneling", label: "Wall Paneling" },
  { value: "kitchen", label: "Kitchen" },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>("all")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== "all") params.set("category", category)
    if (debouncedSearch) params.set("search", debouncedSearch)

    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [category, debouncedSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.18 0.018 60 / 0.5), transparent 70%), oklch(0.09 0.006 55)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">
              TFi Collection
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-heading font-medium text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-tight">
              Our Collection
              <br />
              <span className="italic text-foreground/30">Curated</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 text-base text-muted-foreground max-w-md">
              Flooring, wall paneling, and kitchen solutions — each product selected for its
              craft, material quality, and design integrity.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs
            value={category}
            onValueChange={(v) => setCategory(v as Category)}
          >
            <TabsList variant="line">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.value} value={c.value} className="text-xs tracking-wider">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-8 h-8 text-xs bg-secondary/50 border-border/50 placeholder:text-muted-foreground/40"
              />
            </div>
            <span className="text-xs text-muted-foreground/50 whitespace-nowrap shrink-0">
              {loading ? "…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <Search size={40} className="text-muted-foreground/20" />
            <p className="font-heading text-2xl font-medium text-foreground/40">
              No products found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {products.map((product, i) => (
              <ProductCard key={String(product._id)} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
