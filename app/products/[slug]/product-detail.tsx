"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Minus, Plus, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/fade-in"
import { ProductCard } from "@/components/product-card"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"
import type { Product } from "@/lib/models/product"

const CATEGORY_LABELS: Record<Product["category"], string> = {
  flooring: "Flooring",
  "wall-paneling": "Wall Paneling",
  kitchen: "Kitchen",
}

interface ProductDetailProps {
  product: Product
  related: Product[]
}

export function ProductDetail({ product, related }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const { addItem, toggleCart } = useCartStore()

  function handleAddToCart() {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`, {
      action: {
        label: "View Cart",
        onClick: toggleCart,
      },
    })
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 pb-0 max-w-7xl mx-auto px-6 lg:px-10">
        <nav className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-muted-foreground/50">
          <Link href="/" className="hover:text-muted-foreground transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/products" className="hover:text-muted-foreground transition-colors">Products</Link>
          <ChevronRight size={10} />
          <span className="text-muted-foreground/80">{CATEGORY_LABELS[product.category]}</span>
          <ChevronRight size={10} />
          <span className="text-accent">{product.name}</span>
        </nav>
      </div>

      {/* Main detail */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Left: carousel */}
          <FadeIn>
            <div className="space-y-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((src, i) => (
                    <CarouselItem key={i}>
                      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                        <Image
                          src={toStoredImageUrl(src)}
                          alt={`${product.name} — image ${i + 1}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          priority={i === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-3" />
                <CarouselNext className="right-3" />
              </Carousel>

              {/* Thumbnail strip */}
              <div className="flex gap-2">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-12 shrink-0 overflow-hidden border transition-colors ${
                      activeImage === i ? "border-accent" : "border-border/40 hover:border-border"
                    }`}
                  >
                    <Image src={toStoredImageUrl(src)} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Right: details */}
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <Badge
                variant="outline"
                className="text-[9px] tracking-[0.22em] uppercase border-border/50 text-muted-foreground font-normal mb-2"
              >
                {CATEGORY_LABELS[product.category]} — {product.subcategory}
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground leading-tight">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-foreground">
                  PKR {product.price.toLocaleString("en-PK")}
                </span>
                <span className="text-sm text-muted-foreground">{product.unit}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </FadeIn>

            {/* Specs */}
            <FadeIn delay={0.2}>
              <div className="border border-border/30 overflow-hidden">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-2 text-sm ${
                      i % 2 === 0 ? "bg-secondary/30" : "bg-transparent"
                    }`}
                  >
                    <span className="px-4 py-2.5 text-muted-foreground/70 text-xs tracking-wide">
                      {spec.key}
                    </span>
                    <span className="px-4 py-2.5 text-foreground/90 text-xs border-l border-border/20">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Quantity + Add to cart */}
            <FadeIn delay={0.25}>
              {!product.inStock ? (
                <div className="py-3 text-center border border-border/40 text-muted-foreground text-sm tracking-wider uppercase text-xs">
                  Out of Stock
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-0">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-14 h-10 flex items-center justify-center border-t border-b border-border/60 text-sm tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleAddToCart}
                      className="w-full h-11 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0"
                    >
                      Add to Cart
                    </Button>
                  </motion.div>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-10 text-xs tracking-[0.15em] uppercase border-border/50 text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/contact">Request Custom Quote</Link>
                  </Button>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-border/40 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <FadeIn>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-12">
                You May Also Like
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              {related.map((p, i) => (
                <ProductCard key={String(p._id)} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
