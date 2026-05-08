"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"

type FilterCategory = "all" | "flooring" | "wall-paneling" | "kitchen"

const CATEGORY_LABELS: Record<string, string> = {
  flooring: "Flooring",
  "wall-paneling": "Wall Paneling",
  kitchen: "Kitchen",
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<FilterCategory>("all")
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function handleDelete(slug: string) {
    setDeletingSlug(slug)
    const res = await fetch(`/api/products/${slug}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Product deleted")
      setProducts((prev) => prev.filter((p) => p.slug !== slug))
    } else {
      toast.error("Failed to delete product")
    }
    setDeletingSlug(null)
  }

  const filtered = products.filter((p) => {
    const matchesCat = category === "all" || p.category === category
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q) ||
      (p.collection ?? "").toLowerCase().includes(q) ||
      (p.pattern ?? "").toLowerCase().includes(q) ||
      (p.color ?? "").toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  const featuredCount = products.filter((p) => p.featured).length

  return (
    <div>
      {/* Header */}
      <header className="admin-page-head">
        <div className="admin-page-head__lead">
          <p className="admin-eyebrow">Catalogue</p>
          <h1 className="admin-h1">
            Products<span className="accent">.</span>
          </h1>
          <p className="admin-page-head__sub">
            {products.length} total · {featuredCount} featured on the home page.
          </p>
        </div>
        <div className="admin-page-head__actions">
          <Link href="/admin/products/new" className="admin-pill">
            <Plus size={12} /> Add New Product
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white border border-border/40 px-4 py-3 mb-6">
        <Tabs value={category} onValueChange={(v) => setCategory(v as FilterCategory)}>
          <TabsList variant="line">
            {(["all", "flooring", "wall-paneling", "kitchen"] as FilterCategory[]).map((c) => (
              <TabsTrigger key={c} value={c} className="text-[10px] tracking-[0.18em] uppercase">
                {c === "all" ? "All" : CATEGORY_LABELS[c]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, color, pattern…"
            className="pl-8 h-9 text-xs border-border/60 bg-card"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="admin-table-shell overflow-x-auto">
          <table className="admin-table w-full text-xs min-w-[920px]">
            <thead>
              <tr>
                <th className="text-left px-5 py-4">Product</th>
                <th className="text-left px-5 py-4">Brand</th>
                <th className="text-left px-5 py-4">Category</th>
                <th className="text-left px-5 py-4">Collection</th>
                <th className="text-left px-5 py-4">Price</th>
                <th className="text-left px-5 py-4">Stock</th>
                <th className="text-left px-5 py-4">Featured</th>
                <th className="text-right px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground/40">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={String(product._id)}
                    className="border-t border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 shrink-0 bg-secondary overflow-hidden">
                          <Image
                            src={toStoredImageUrl(product.images[0])}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground/95 truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground/60 truncate">{product.pattern ?? "—"} · {product.color ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-foreground/85">
                      {product.brand ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {product.collection ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-foreground/85">
                      £{product.price.toLocaleString("en-GB")}
                      <span className="block text-[10px] text-muted-foreground/55">{product.unit}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] tracking-wider uppercase ${
                          product.inStock
                            ? "border-[rgba(33,35,37,0.22)] bg-[rgba(33,35,37,0.06)] text-[#212325]"
                            : "border-dashed border-[rgba(33,35,37,0.3)] bg-transparent text-muted-foreground"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {product.featured ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase text-foreground/85">
                          <Star size={10} className="fill-current" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link href={`/admin/products/${product.slug}/edit`}>
                            <Pencil size={13} />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="text-destructive/60 hover:text-destructive">
                              <Trash2 size={13} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &ldquo;{product.name}&rdquo;? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.slug)}
                                disabled={deletingSlug === product.slug}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
