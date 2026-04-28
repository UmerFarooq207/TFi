"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"

const schema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  postcode: z.string().min(3, "Postcode is required"),
  country: z.string().min(2, "Country is required"),
})

type FormData = z.infer<typeof schema>

const fmt = (n: number) =>
  `PKR ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`

const DELIVERY = 4500
const TAX_RATE = 0.18

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, updateQuantity, removeItem, clearCart } = useCartStore()
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "Pakistan" },
  })

  if (!mounted) return null

  const subtotal = getTotal()
  const tax = subtotal * TAX_RATE
  const total = items.length > 0 ? subtotal + DELIVERY + tax : 0

  async function onSubmit(data: FormData) {
    if (items.length === 0) return
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
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: "",
            address: data.address,
            city: data.city,
            postcode: data.postcode,
            country: data.country,
          },
          items: orderItems,
          subtotal,
          total,
          notes: "",
        }),
      })

      if (!res.ok) throw new Error("Order failed")
      const order = await res.json()
      clearCart()
      router.push(`/order-confirmed?orderNumber=${order.orderNumber}&name=${encodeURIComponent(data.firstName)}`)
    } catch {
      toast.error("Failed to place order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>Cart &amp; checkout
        </span>
        <Link href="/products" className="tfi-link">↳ Continue shopping</Link>
      </div>

      <section className="ck">
        <h1>Your selection.</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ck__grid">
            <div>
              {items.length === 0 ? (
                <div className="ck__empty">
                  <div className="ck__empty__title">Your cart is empty.</div>
                  <p>
                    Browse the{" "}
                    <Link href="/products" style={{ color: "inherit" }}>collections</Link>{" "}
                    or run an{" "}
                    <Link href="/calculator" style={{ color: "inherit" }}>estimate</Link>.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const id = String(item.product._id)
                  const sku = id.slice(-4).toUpperCase()
                  return (
                    <div key={id} className="ck__row">
                      <div className="ck__row__img">
                        <Image
                          src={toStoredImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          fill
                          sizes="100px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="ck__row__name">
                          <span style={{ color: "var(--tfi-mute)", marginRight: 6, fontSize: "0.8em" }}>
                            {sku}
                          </span>
                          {item.product.name}
                        </div>
                        <div className="ck__row__line">
                          {item.product.subcategory} · {fmt(item.product.price)}/{item.product.unit || "unit"}
                        </div>
                        <div style={{ marginTop: 10 }} className="ck__qty">
                          <button
                            type="button"
                            onClick={() => updateQuantity(id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="ck__row__price">{fmt(item.product.price * item.quantity)}</div>
                      <button
                        type="button"
                        className="ck__row__rm"
                        onClick={() => removeItem(id)}
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <aside className="ck__summary">
              <div className="t-eyebrow" style={{ color: "var(--tfi-mute)", marginBottom: 14 }}>
                Summary
              </div>
              <table>
                <tbody>
                  <tr><td>Subtotal</td><td>{fmt(subtotal)}</td></tr>
                  <tr><td>Delivery (standard)</td><td>{fmt(items.length > 0 ? DELIVERY : 0)}</td></tr>
                  <tr><td>Tax (18%)</td><td>{fmt(tax)}</td></tr>
                  <tr className="tot"><td>Total</td><td>{fmt(total)}</td></tr>
                </tbody>
              </table>

              <div className="ck__form">
                <div className="full">
                  <input
                    placeholder="Email"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email && <div style={{ fontSize: 12, color: "var(--destructive)", marginTop: 4 }}>{errors.email.message}</div>}
                </div>
                <div>
                  <input placeholder="First name" {...register("firstName")} />
                  {errors.firstName && <div style={{ fontSize: 12, color: "var(--destructive)", marginTop: 4 }}>{errors.firstName.message}</div>}
                </div>
                <div>
                  <input placeholder="Last name" {...register("lastName")} />
                  {errors.lastName && <div style={{ fontSize: 12, color: "var(--destructive)", marginTop: 4 }}>{errors.lastName.message}</div>}
                </div>
                <div className="full">
                  <input placeholder="Address line 1" {...register("address")} />
                  {errors.address && <div style={{ fontSize: 12, color: "var(--destructive)", marginTop: 4 }}>{errors.address.message}</div>}
                </div>
                <div>
                  <input placeholder="City" {...register("city")} />
                  {errors.city && <div style={{ fontSize: 12, color: "var(--destructive)", marginTop: 4 }}>{errors.city.message}</div>}
                </div>
                <div>
                  <input placeholder="Postcode" {...register("postcode")} />
                  {errors.postcode && <div style={{ fontSize: 12, color: "var(--destructive)", marginTop: 4 }}>{errors.postcode.message}</div>}
                </div>
                <select className="full" {...register("country")} defaultValue="Pakistan">
                  <option>Pakistan</option>
                  <option>United Kingdom</option>
                  <option>United Arab Emirates</option>
                  <option>Saudi Arabia</option>
                </select>
              </div>

              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="submit"
                  className="tfi-pill"
                  style={{ justifyContent: "center" }}
                  disabled={submitting || items.length === 0}
                >
                  <span className="arrow">↳</span>
                  {submitting ? "Placing order…" : "Pay & place order"}
                </button>
                <Link
                  href="/contact"
                  className="tfi-pill tfi-pill--outline"
                  style={{ justifyContent: "center" }}
                >
                  <span className="arrow">↳</span>Request trade quote instead
                </Link>
              </div>
            </aside>
          </div>
        </form>
      </section>
    </>
  )
}
