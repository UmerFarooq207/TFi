"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
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
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50 mb-1">
            Catalogue
          </p>
          <h1 className="font-heading text-2xl font-medium text-foreground">Products</h1>
        </div>
        <Button asChild size="sm" className="text-xs tracking-[0.15em] uppercase">
          <Link href="/admin/products/new">
            <Plus size={12} className="mr-1.5" /> Add New Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Tabs value={category} onValueChange={(v) => setCategory(v as FilterCategory)}>
          <TabsList variant="line">
            {(["all", "flooring", "wall-paneling", "kitchen"] as FilterCategory[]).map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs">
                {c === "all" ? "All" : CATEGORY_LABELS[c]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-56">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-8 h-8 text-xs border-border"
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
        <div className="border border-border/40 overflow-hidden overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/40">
                <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                  Stock
                </th>
                <th className="text-right px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground/40">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={String(product._id)}
                    className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 shrink-0 bg-secondary overflow-hidden">
                          <Image
                            src={toStoredImageUrl(product.images[0])}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-foreground/90">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      PKR {product.price.toLocaleString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
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
