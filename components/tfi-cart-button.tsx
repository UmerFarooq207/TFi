"use client"

import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart"

/**
 * Cart icon button. Designed to sit inside a `.tfi-topbar` next to the
 * "Get a quote" link, so it inherits exactly the topbar's positioning
 * and scroll behavior on whichever page it's mounted on.
 *
 * Pass `tone="ink"` on cream pages and leave default for image/dark
 * hero pages.
 */
export function TfiCartButton({ tone = "light" }: { tone?: "light" | "ink" }) {
  const itemCount = useCartStore((s) => s.getItemCount())
  const isOpen = useCartStore((s) => s.isOpen)
  const toggleCart = useCartStore((s) => s.toggleCart)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isOpen) return null

  // During SSR + first client render, render with no count to avoid hydration mismatch.
  // The cart store hydrates from localStorage only after mount.
  const showCount = mounted && itemCount > 0

  return (
    <button
      type="button"
      className={`tfi-cart-fab${tone === "ink" ? " tfi-cart-fab--ink" : ""}`}
      onClick={toggleCart}
      aria-label={showCount ? `Open cart (${itemCount} items)` : "Open cart"}
    >
      <ShoppingBag size={20} strokeWidth={1.6} aria-hidden />
      {showCount && <span className="tfi-cart-fab__count">{itemCount}</span>}
    </button>
  )
}
