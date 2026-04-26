"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/fade-in"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/products")
    }
  }, [mounted, items.length, router])

  if (!mounted) return null

  const total = getTotal()

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      const orderItems = items.map((i) => ({
        productId: String(i.product._id),
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: toStoredImageUrl(i.product.images[0]),
      }))

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
          },
          items: orderItems,
          subtotal: total,
          total,
          notes: data.notes ?? "",
        }),
      })

      if (!res.ok) throw new Error("Order failed")

      const order = await res.json()
      clearCart()
      router.push(`/order-confirmed?orderNumber=${order.orderNumber}&name=${encodeURIComponent(data.name)}`)
    } catch {
      toast.error("Failed to place order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-28 pb-24">
      <FadeIn>
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Checkout</p>
        <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-12">
          Complete Your Order
        </h1>
      </FadeIn>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">

          {/* Form */}
          <FadeIn delay={0.1}>
            <div className="space-y-10">

              {/* Customer details */}
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-5">
                  Customer Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="name" className="text-xs tracking-wide text-muted-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className="h-10 bg-secondary/40 border-border/50 text-sm"
                      placeholder="Muhammad Ali"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs tracking-wide text-muted-foreground">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="h-10 bg-secondary/40 border-border/50 text-sm"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs tracking-wide text-muted-foreground">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      className="h-10 bg-secondary/40 border-border/50 text-sm"
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-5">
                  Delivery Address
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs tracking-wide text-muted-foreground">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      {...register("address")}
                      className="h-10 bg-secondary/40 border-border/50 text-sm"
                      placeholder="House 123, Street 4, DHA Phase 5"
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs tracking-wide text-muted-foreground">
                      City *
                    </Label>
                    <Input
                      id="city"
                      {...register("city")}
                      className="h-10 bg-secondary/40 border-border/50 text-sm"
                      placeholder="Karachi"
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-xs tracking-wide text-muted-foreground">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      rows={3}
                      className="bg-secondary/40 border-border/50 text-sm resize-none"
                      placeholder="Any special delivery instructions…"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Order summary */}
          <FadeIn delay={0.15}>
            <div className="lg:sticky lg:top-28 border border-border/40 p-6 space-y-5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60">
                Order Summary
              </p>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={String(item.product._id)} className="flex gap-3 items-start">
                    <div className="relative w-14 h-14 shrink-0 bg-secondary overflow-hidden">
                      <Image
                        src={toStoredImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs text-foreground shrink-0">
                      PKR {(item.product.price * item.quantity).toLocaleString("en-PK")}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/30" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-base font-medium text-foreground">
                  PKR {total.toLocaleString("en-PK")}
                </span>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Placing Order…
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </FadeIn>
        </div>
      </form>
    </section>
  )
}
