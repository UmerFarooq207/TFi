"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"

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
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l border-border/50"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <SheetTitle className="font-heading text-lg font-medium">Your Cart</SheetTitle>
            {itemCount > 0 && (
              <Badge className="bg-accent text-accent-foreground text-[10px] h-5 min-w-5 rounded-full px-1.5">
                {itemCount}
              </Badge>
            )}
          </div>
          <button
            onClick={toggleCart}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <ShoppingBag size={40} className="text-muted-foreground/30" />
              <p className="font-heading text-xl font-medium text-foreground/60">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground">
                Browse our collection to find something you love.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 text-xs tracking-[0.15em] uppercase"
                onClick={toggleCart}
              >
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={String(item.product._id)}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex gap-4 py-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 shrink-0 bg-secondary overflow-hidden">
                      <Image
                        src={toStoredImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground/60 mb-0.5">
                        {item.product.category.replace("-", " ")}
                      </p>
                      <p className="text-sm font-medium text-foreground leading-snug truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        PKR {(item.product.price * item.quantity).toLocaleString("en-PK")}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(String(item.product._id), item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs text-foreground w-4 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(String(item.product._id), item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(String(item.product._id))}
                      className="text-muted-foreground/50 hover:text-foreground transition-colors self-start pt-0.5"
                      aria-label="Remove item"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <Separator className="bg-border/30" />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/40 px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-base font-medium text-foreground">
                PKR {total.toLocaleString("en-PK")}
              </span>
            </div>
            <Button
              className="w-full h-11 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0"
              onClick={() => {
                toggleCart()
                router.push("/checkout")
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="ghost"
              className="w-full h-9 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground"
              onClick={toggleCart}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
