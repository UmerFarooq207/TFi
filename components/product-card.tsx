"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/models/product"

const CATEGORY_LABELS: Record<Product["category"], string> = {
  flooring: "Flooring",
  "wall-paneling": "Wall Paneling",
  kitchen: "Kitchen",
}

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={toStoredImageUrl(product.images[0])}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors duration-300 flex items-center justify-center">
            <span className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-[10px] tracking-[0.25em] uppercase text-foreground border border-foreground/60 px-5 py-2.5">
              View Product
            </span>
          </div>
          {/* Out of stock badge */}
          {!product.inStock && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-4 space-y-1.5">
          <Badge
            variant="outline"
            className="text-[9px] tracking-[0.22em] uppercase border-border/50 text-muted-foreground font-normal"
          >
            {CATEGORY_LABELS[product.category]}
          </Badge>
          <h3 className="font-heading text-base font-medium text-foreground leading-snug group-hover:text-accent transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            PKR {product.price.toLocaleString("en-PK")}{" "}
            <span className="text-xs text-muted-foreground/60">{product.unit}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
