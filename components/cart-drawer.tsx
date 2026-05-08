"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, X } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"

const fmt = (n: number) =>
  `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore()
  const router = useRouter()
  const itemCount = getItemCount()
  const total = getTotal()

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="tfi-drawer"
      >
        <header className="tfi-drawer__head">
          <div>
            <span className="tfi-drawer__eyebrow">
              <span className="diamond">◆</span>Your selection
            </span>
            <SheetTitle className="tfi-drawer__title">
              Cart {itemCount > 0 && <span className="tfi-drawer__count">· {itemCount}</span>}
            </SheetTitle>
          </div>
          <button
            type="button"
            className="tfi-drawer__close"
            onClick={toggleCart}
            aria-label="Close cart"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        <div className="tfi-drawer__body">
          {items.length === 0 ? (
            <div className="tfi-drawer__empty">
              <div className="tfi-drawer__empty-mark" aria-hidden>◆</div>
              <p className="tfi-drawer__empty-title">Nothing here yet.</p>
              <p className="tfi-drawer__empty-copy">
                Browse the collection — every plank, panel, and surface is built to be held
                in hand before it's specified.
              </p>
              <Link
                href="/products"
                className="tfi-pill tfi-drawer__empty-cta"
                onClick={toggleCart}
              >
                <span className="arrow">↳</span>Browse the collection
              </Link>
            </div>
          ) : (
            <ul className="tfi-drawer__list">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={String(item.product._id)}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    className="tfi-drawer__row-wrap"
                  >
                    <article className="tfi-drawer__row">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={toggleCart}
                        className="tfi-drawer__thumb"
                      >
                        <Image
                          src={toStoredImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                        />
                      </Link>
                      <div className="tfi-drawer__info">
                        <span className="tfi-drawer__cat">
                          {item.product.category.replace(/-/g, " ")}
                        </span>
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={toggleCart}
                          className="tfi-drawer__name"
                        >
                          {item.product.name}
                        </Link>
                        <div className="tfi-drawer__row-foot">
                          <div className="tfi-drawer__qty">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(String(item.product._id), item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} strokeWidth={1.8} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(String(item.product._id), item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} strokeWidth={1.8} />
                            </button>
                          </div>
                          <span className="tfi-drawer__price">
                            {fmt(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="tfi-drawer__remove"
                        onClick={() => removeItem(String(item.product._id))}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <X size={14} strokeWidth={1.6} />
                      </button>
                    </article>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="tfi-drawer__foot">
            <div className="tfi-drawer__sub">
              <span className="lbl">Subtotal</span>
              <span className="val">{fmt(total)}</span>
            </div>
            <p className="tfi-drawer__note">
              Delivery and trade pricing calculated at checkout.
            </p>
            <button
              type="button"
              className="tfi-pill tfi-drawer__checkout"
              onClick={() => {
                toggleCart()
                router.push("/cart")
              }}
            >
              <span className="arrow">↳</span>View cart
            </button>
            <button
              type="button"
              className="tfi-drawer__keep"
              onClick={toggleCart}
            >
              Keep browsing
            </button>
          </footer>
        )}
      </SheetContent>
    </Sheet>
  )
}
