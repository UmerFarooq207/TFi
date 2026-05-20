"use client"

import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import type { Product } from "@/lib/models/product"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"

const fmtPrice = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

export function FeaturedProductCard({ product }: { product: Product }) {
  const { addItem, toggleCart } = useCartStore()

  function handleAddToCart() {
    addItem(product, 1)
    toast.success(`${product.name} added to cart`, {
      action: { label: "View Cart", onClick: toggleCart },
    })
  }

  return (
    <div className="p-card">
      <Link href={`/products/${product.slug}`} className="p-card__link">
        <div className="p-card__media">
          <span className="p-card__badge">Featured</span>
          <Image
            src={toStoredImageUrl(product.images[0] ?? "")}
            alt={product.name}
            fill
            sizes="(max-width: 540px) 50vw, (max-width: 1100px) 33vw, 20vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="p-card__body">
          <span className="p-card__cat">
            {product.brand} · {product.collection}
          </span>
          <span className="p-card__title">{product.name}</span>
          <span className="p-card__row">
            <span className="p-card__price">{fmtPrice(product.price)}</span>
            {product.unit && (
              <span className="p-card__price--old" style={{ textDecoration: "none" }}>
                {product.unit}
              </span>
            )}
          </span>
        </div>
      </Link>
      <div className="p-card__actions">
        <button type="button" className="p-card__btn p-card__btn--cart" onClick={handleAddToCart}>
          Add to cart
        </button>
        <Link href={`/calculator?product=${product.slug}`} className="p-card__btn p-card__btn--est">
          Estimate
        </Link>
      </div>
    </div>
  )
}
