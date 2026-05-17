"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, X, Loader2, CreditCard, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { toStoredImageUrl } from "@/lib/image-url"
import { useCartStore } from "@/store/cart"
import { TfiCartButton } from "@/components/tfi-cart-button"
import {
  quoteDelivery,
  isValidUkPostcode,
  STANDARD_FEE,
  type DeliveryQuote,
} from "@/lib/delivery"
import { API_ERROR_MESSAGE } from "@/lib/api-errors"

const fmt = (n: number) =>
  `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

const TAX_RATE = 0.18

type Stage = "cart" | "checkout" | "payment"

const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  postcode: z.string().min(3, "Postcode is required"),
  country: z.string().min(2, "Country is required"),
})
type CheckoutData = z.infer<typeof checkoutSchema>

const paymentSchema = z.object({
  cardName: z.string().min(2, "Cardholder name required"),
  cardNumber: z
    .string()
    .min(13, "Card number invalid")
    .max(23, "Card number invalid")
    .regex(/^[\d\s]+$/, "Digits only"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/, "MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "3 or 4 digits"),
})
type PaymentData = z.infer<typeof paymentSchema>

type AppliedPromo = {
  code: string
  type: "percent" | "fixed"
  value: number
  discount: number
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function CartFlowPage() {
  const router = useRouter()
  const { items, getTotal, getItemCount, updateQuantity, removeItem, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [stage, setStage] = useState<Stage>("cart")
  const [direction, setDirection] = useState(1)
  const [savedCheckout, setSavedCheckout] = useState<CheckoutData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Promo state (lives at the top so it survives stage changes)
  const [promoInput, setPromoInput] = useState("")
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  // Delivery quote derived from the postcode entered at checkout
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null)

  useEffect(() => setMounted(true), [])

  const subtotal = mounted ? getTotal() : 0
  const itemCount = mounted ? getItemCount() : 0

  const discount = appliedPromo
    ? appliedPromo.type === "percent"
      ? Math.round((subtotal * appliedPromo.value) / 100)
      : Math.min(appliedPromo.value, subtotal)
    : 0

  const tax = Math.max(0, subtotal - discount) * TAX_RATE
  // Default to the standard UK rate until a valid postcode resolves to a local quote
  const delivery = items.length > 0 ? (deliveryQuote?.fee ?? STANDARD_FEE) : 0
  const total = items.length > 0 ? Math.max(0, subtotal - discount) + delivery + tax : 0

  // Drop promo if cart empties
  useEffect(() => {
    if (mounted && items.length === 0 && appliedPromo) {
      setAppliedPromo(null)
      setPromoInput("")
    }
  }, [mounted, items.length, appliedPromo])

  if (!mounted) return null

  function gotoStage(next: Stage) {
    if (next === stage) return
    const order: Record<Stage, number> = { cart: 0, checkout: 1, payment: 2 }
    // Forward only if predecessor is satisfied
    if (next === "checkout" && items.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    if (next === "payment" && !savedCheckout) {
      toast.error("Complete the checkout details first")
      return
    }
    setDirection(order[next] > order[stage] ? 1 : -1)
    setStage(next)
  }

  async function applyPromo() {
    const code = promoInput.trim()
    if (!code) {
      setPromoError("Enter a promo code")
      return
    }
    if (subtotal <= 0) {
      setPromoError("Add items to your cart first")
      return
    }
    setApplyingPromo(true)
    setPromoError(null)
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setPromoError(API_ERROR_MESSAGE)
        setAppliedPromo(null)
      } else {
        setAppliedPromo({
          code: json.code,
          type: json.type,
          value: json.value,
          discount: json.discount,
        })
        toast.success(`Promo ${json.code} applied`)
      }
    } catch {
      setPromoError(API_ERROR_MESSAGE)
    } finally {
      setApplyingPromo(false)
    }
  }

  function removePromo() {
    setAppliedPromo(null)
    setPromoInput("")
    setPromoError(null)
  }

  async function placeOrder() {
    if (!savedCheckout) return
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
            name: `${savedCheckout.firstName} ${savedCheckout.lastName}`,
            email: savedCheckout.email,
            phone: "",
            address: savedCheckout.address,
            city: savedCheckout.city,
            postcode: savedCheckout.postcode,
            country: savedCheckout.country,
          },
          items: orderItems,
          subtotal,
          total,
          promoCode: appliedPromo?.code,
          notes: "",
        }),
      })

      if (!res.ok) throw new Error(API_ERROR_MESSAGE)
      const order = await res.json()
      clearCart()
      router.push(
        `/order-confirmed?orderNumber=${order.orderNumber}&name=${encodeURIComponent(savedCheckout.firstName)}`
      )
    } catch {
      toast.error(API_ERROR_MESSAGE)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>
          {stage === "cart" ? "Your selection" : stage === "checkout" ? "Checkout" : "Payment"}
        </span>
        <div className="tfi-topbar__right">
          <Link href="/products" className="tfi-link">↳ Continue shopping</Link>
          <TfiCartButton tone="ink" />
        </div>
      </div>

      {/* ============ HERO + STEPPER ============ */}
      <section className="cart-hero">
        <div className="cart-hero__crumbs">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          {stage === "cart" ? "Cart" : stage === "checkout" ? "Cart / Checkout" : "Cart / Checkout / Payment"}
        </div>
        <h1 className="cart-hero__title">
          {stage === "cart" && (
            items.length > 0
              ? <>Your cart<br />— {itemCount} {itemCount === 1 ? "item" : "items"}.</>
              : <>Your cart<br />is waiting.</>
          )}
          {stage === "checkout" && <>Where shall we<br />send it.</>}
          {stage === "payment" && <>One last step —<br />payment.</>}
        </h1>

        <ol className="cart-stepper" role="tablist" aria-label="Checkout steps">
          {(["cart", "checkout", "payment"] as Stage[]).map((s, i) => {
            const labels: Record<Stage, string> = { cart: "Cart", checkout: "Checkout", payment: "Payment" }
            const isActive = s === stage
            const isReachable =
              s === "cart" ||
              (s === "checkout" && items.length > 0) ||
              (s === "payment" && savedCheckout != null)
            return (
              <li
                key={s}
                className={isActive ? "is-active" : ""}
                role="tab"
                aria-selected={isActive}
                onClick={() => isReachable && gotoStage(s)}
                style={{
                  cursor: isReachable ? "pointer" : "not-allowed",
                  opacity: isReachable ? undefined : 0.4,
                }}
              >
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="lbl">{labels[s]}</span>
              </li>
            )
          })}
        </ol>
      </section>

      {/* ============ STAGES (animated) ============ */}
      <section className="cart-layout" style={{ position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          {stage === "cart" && (
            <motion.div
              key="cart"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "contents" }}
            >
              {/* Items column */}
              <div className="cart-list">
                {items.length === 0 ? (
                  <div className="cart-empty">
                    <div className="cart-empty__mark" aria-hidden>◆</div>
                    <h2 className="cart-empty__title">No pieces in your cart yet.</h2>
                    <p className="cart-empty__copy">
                      Browse the collection — every plank, panel, and surface is built to be held in
                      hand before it&apos;s specified.
                    </p>
                    <div className="cart-empty__actions">
                      <Link href="/products" className="tfi-pill">
                        <span className="arrow">↳</span>Browse the collection
                      </Link>
                      <Link href="/calculator" className="tfi-pill tfi-pill--outline">
                        <span className="arrow">↳</span>Run an estimate
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="cart-list__head">
                      <span>Item</span>
                      <span>Quantity</span>
                      <span>Total</span>
                      <span aria-hidden />
                    </div>
                    <ul className="cart-list__rows">
                      {items.map((item) => {
                        const id = String(item.product._id)
                        const lineTotal = item.product.price * item.quantity
                        return (
                          <li key={id} className="cart-row">
                            <Link href={`/products/${item.product.slug}`} className="cart-row__media">
                              <Image
                                src={toStoredImageUrl(item.product.images[0])}
                                alt={item.product.name}
                                fill
                                sizes="140px"
                                style={{ objectFit: "cover" }}
                              />
                            </Link>
                            <div className="cart-row__info">
                              <span className="cart-row__cat">
                                {item.product.brand ?? item.product.category}
                                {item.product.collection ? ` · ${item.product.collection}` : ""}
                              </span>
                              <Link href={`/products/${item.product.slug}`} className="cart-row__name">
                                {item.product.name}
                              </Link>
                              <span className="cart-row__unit">
                                {fmt(item.product.price)}
                                {item.product.unit && <> / {item.product.unit}</>}
                              </span>
                            </div>
                            <div className="cart-row__qty">
                              <button type="button" onClick={() => updateQuantity(id, item.quantity - 1)} aria-label="Decrease quantity">
                                <Minus size={12} strokeWidth={1.8} />
                              </button>
                              <span>{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(id, item.quantity + 1)} aria-label="Increase quantity">
                                <Plus size={12} strokeWidth={1.8} />
                              </button>
                            </div>
                            <div className="cart-row__total">{fmt(lineTotal)}</div>
                            <button
                              type="button"
                              className="cart-row__remove"
                              onClick={() => removeItem(id)}
                              aria-label={`Remove ${item.product.name}`}
                            >
                              <X size={15} strokeWidth={1.6} />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="cart-list__foot">
                      <Link href="/products" className="cart-list__continue">↳ Continue shopping</Link>
                      <span className="cart-list__count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Summary */}
              <aside className="cart-summary">
                <div className="cart-summary__inner">
                  <span className="t-eyebrow">
                    <span className="diamond">◆</span>Order summary
                  </span>
                  <h3 className="cart-summary__heading">What you&apos;ll pay.</h3>
                  <dl className="cart-summary__list">
                    <div><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
                    <div><dt>Delivery</dt><dd>{items.length > 0 ? fmt(delivery) : "—"}</dd></div>
                    <div><dt>Tax (18%)</dt><dd>{fmt(tax)}</dd></div>
                  </dl>
                  <div className="cart-summary__total">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </div>

                  <button
                    type="button"
                    className="tfi-pill cart-summary__checkout"
                    onClick={() => gotoStage("checkout")}
                    disabled={items.length === 0}
                  >
                    <span className="arrow">↳</span>Proceed to checkout
                  </button>

                  <ul className="cart-summary__perks">
                    <li><span className="perk-mark" aria-hidden>◆</span>Free trade fittings consult</li>
                    <li><span className="perk-mark" aria-hidden>◆</span>15-year commercial warranty</li>
                    <li><span className="perk-mark" aria-hidden>◆</span>UK-wide delivery, FSC certified</li>
                  </ul>

                  <p className="cart-summary__note">
                    Trade pricing and delivery surcharges are reviewed at checkout — usually within
                    one business day.
                  </p>
                </div>
              </aside>
            </motion.div>
          )}

          {stage === "checkout" && (
            <motion.div
              key="checkout"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "contents" }}
            >
              <CheckoutStage
                initial={savedCheckout}
                onBack={() => gotoStage("cart")}
                onContinue={(data) => {
                  setSavedCheckout(data)
                  setDirection(1)
                  setStage("payment")
                }}
                appliedPromo={appliedPromo}
                promoInput={promoInput}
                setPromoInput={setPromoInput}
                applyingPromo={applyingPromo}
                applyPromo={applyPromo}
                removePromo={removePromo}
                promoError={promoError}
                setPromoError={setPromoError}
                discount={discount}
                subtotal={subtotal}
                delivery={delivery}
                deliveryQuote={deliveryQuote}
                onDeliveryQuoteChange={setDeliveryQuote}
                tax={tax}
                total={total}
              />
            </motion.div>
          )}

          {stage === "payment" && (
            <motion.div
              key="payment"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "contents" }}
            >
              <PaymentStage
                onBack={() => gotoStage("checkout")}
                onPay={placeOrder}
                submitting={submitting}
                appliedPromo={appliedPromo}
                discount={discount}
                subtotal={subtotal}
                delivery={delivery}
                tax={tax}
                total={total}
                customerName={savedCheckout ? `${savedCheckout.firstName} ${savedCheckout.lastName}` : ""}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}

/* ============================================================
   CHECKOUT STAGE — address form + promo
   ============================================================ */

function CheckoutStage({
  initial,
  onBack,
  onContinue,
  appliedPromo,
  promoInput,
  setPromoInput,
  applyingPromo,
  applyPromo,
  removePromo,
  promoError,
  setPromoError,
  discount,
  subtotal,
  delivery,
  deliveryQuote,
  onDeliveryQuoteChange,
  tax,
  total,
}: {
  initial: CheckoutData | null
  onBack: () => void
  onContinue: (data: CheckoutData) => void
  appliedPromo: AppliedPromo | null
  promoInput: string
  setPromoInput: (v: string) => void
  applyingPromo: boolean
  applyPromo: () => void
  removePromo: () => void
  promoError: string | null
  setPromoError: (v: string | null) => void
  discount: number
  subtotal: number
  delivery: number
  deliveryQuote: DeliveryQuote | null
  onDeliveryQuoteChange: (q: DeliveryQuote | null) => void
  tax: number
  total: number
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initial ?? { country: "United Kingdom", email: "", firstName: "", lastName: "", address: "", city: "", postcode: "" },
  })

  const postcodeValue = watch("postcode") ?? ""
  const countryValue = watch("country")
  const [quotingDelivery, setQuotingDelivery] = useState(false)

  // Debounced postcode → delivery fee lookup
  useEffect(() => {
    if (countryValue && countryValue !== "United Kingdom") {
      // Non-UK addresses skip the postcode lookup; standard fee applies via parent default
      onDeliveryQuoteChange(null)
      setQuotingDelivery(false)
      return
    }
    const trimmed = postcodeValue.trim()
    if (!trimmed) {
      onDeliveryQuoteChange(null)
      setQuotingDelivery(false)
      return
    }
    if (!isValidUkPostcode(trimmed)) {
      onDeliveryQuoteChange(null)
      setQuotingDelivery(false)
      return
    }
    const controller = new AbortController()
    setQuotingDelivery(true)
    const t = setTimeout(async () => {
      try {
        const q = await quoteDelivery(trimmed, controller.signal)
        onDeliveryQuoteChange(q)
      } finally {
        setQuotingDelivery(false)
      }
    }, 400)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [postcodeValue, countryValue, onDeliveryQuoteChange])

  return (
    <form onSubmit={handleSubmit(onContinue)} className="cart-list" style={{ gridColumn: "1 / -1" }}>
      <div className="ck2">
        <div className="ck2__form">
          <p className="ck2__sec">Contact</p>
          <div className="ck2__row ck2__row--full">
            <input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <p className="ck2__err">{errors.email.message}</p>}
          </div>

          <p className="ck2__sec">Shipping address</p>
          <div className="ck2__row">
            <input placeholder="First name" {...register("firstName")} />
            {errors.firstName && <p className="ck2__err">{errors.firstName.message}</p>}
          </div>
          <div className="ck2__row">
            <input placeholder="Last name" {...register("lastName")} />
            {errors.lastName && <p className="ck2__err">{errors.lastName.message}</p>}
          </div>
          <div className="ck2__row ck2__row--full">
            <input placeholder="Address line 1" {...register("address")} />
            {errors.address && <p className="ck2__err">{errors.address.message}</p>}
          </div>
          <div className="ck2__row">
            <input placeholder="City" {...register("city")} />
            {errors.city && <p className="ck2__err">{errors.city.message}</p>}
          </div>
          <div className="ck2__row">
            <input placeholder="Postcode" {...register("postcode")} />
            {errors.postcode && <p className="ck2__err">{errors.postcode.message}</p>}
          </div>
          <div className="ck2__row ck2__row--full">
            <select {...register("country")}>
              <option>United Kingdom</option>
              <option>Ireland</option>
              <option>United Arab Emirates</option>
              <option>Saudi Arabia</option>
              <option>United States</option>
            </select>
          </div>

          <p className="ck2__sec">Promo code</p>
          {appliedPromo ? (
            <div className="ck2__promo-applied">
              <div>
                <strong>{appliedPromo.code}</strong>
                <span> · {appliedPromo.type === "percent" ? `${appliedPromo.value}% off` : `${fmt(appliedPromo.value)} off`}</span>
              </div>
              <button type="button" onClick={removePromo} aria-label="Remove promo">×</button>
            </div>
          ) : (
            <>
              <div className="ck2__promo-row">
                <input
                  placeholder="Enter code"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value)
                    if (promoError) setPromoError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      applyPromo()
                    }
                  }}
                />
                <button type="button" onClick={applyPromo} disabled={applyingPromo} className="tfi-pill tfi-pill--outline">
                  {applyingPromo ? "…" : "Apply"}
                </button>
              </div>
              {promoError && <p className="ck2__err">{promoError}</p>}
            </>
          )}

          <div className="ck2__actions">
            <button type="button" className="tfi-pill tfi-pill--outline" onClick={onBack}>
              ← Back to cart
            </button>
            <button type="submit" className="tfi-pill">
              <span className="arrow">↳</span>Continue to payment
            </button>
          </div>
        </div>

        <aside className="ck2__summary">
          <p className="t-eyebrow ck2__summary-eb"><span className="diamond">◆</span>Order summary</p>
          <dl>
            <div><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
            {appliedPromo && (
              <div className="ck2__discount"><dt>Promo · {appliedPromo.code}</dt><dd>− {fmt(discount)}</dd></div>
            )}
            <div>
              <dt>
                Delivery
                {countryValue === "United Kingdom" && (
                  <span style={{ display: "block", fontSize: 11, opacity: 0.65, marginTop: 2 }}>
                    {quotingDelivery
                      ? "Calculating…"
                      : deliveryQuote?.band === "local"
                        ? "Birmingham · within 10 mi"
                        : deliveryQuote?.band === "uk"
                          ? "UK-wide"
                          : "Enter postcode for accurate rate"}
                  </span>
                )}
              </dt>
              <dd>{fmt(delivery)}</dd>
            </div>
            <div><dt>Tax (18%)</dt><dd>{fmt(tax)}</dd></div>
          </dl>
          <div className="ck2__summary-total">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </aside>
      </div>
    </form>
  )
}

/* ============================================================
   PAYMENT STAGE — card details
   ============================================================ */

function PaymentStage({
  onBack,
  onPay,
  submitting,
  appliedPromo,
  discount,
  subtotal,
  delivery,
  tax,
  total,
  customerName,
}: {
  onBack: () => void
  onPay: () => void
  submitting: boolean
  appliedPromo: AppliedPromo | null
  discount: number
  subtotal: number
  delivery: number
  tax: number
  total: number
  customerName: string
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardName: customerName, cardNumber: "", expiry: "", cvv: "" },
  })

  function formatCardNumber(v: string): string {
    return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim()
  }
  function formatExpiry(v: string): string {
    const digits = v.replace(/\D/g, "").slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return (
    <div className="cart-list" style={{ gridColumn: "1 / -1" }}>
      <form onSubmit={handleSubmit(() => onPay())} className="ck2">
        <div className="ck2__form">
          <p className="ck2__sec">Card details</p>
          <div className="ck2__row ck2__row--full">
            <label className="ck2__label">
              <CreditCard size={14} /> Cardholder name
            </label>
            <input placeholder="As shown on card" {...register("cardName")} />
            {errors.cardName && <p className="ck2__err">{errors.cardName.message}</p>}
          </div>
          <div className="ck2__row ck2__row--full">
            <label className="ck2__label">Card number</label>
            <input
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              {...register("cardNumber")}
              onChange={(e) => setValue("cardNumber", formatCardNumber(e.target.value))}
            />
            {errors.cardNumber && <p className="ck2__err">{errors.cardNumber.message}</p>}
          </div>
          <div className="ck2__row">
            <label className="ck2__label">Expiry</label>
            <input
              placeholder="MM / YY"
              inputMode="numeric"
              {...register("expiry")}
              onChange={(e) => setValue("expiry", formatExpiry(e.target.value))}
            />
            {errors.expiry && <p className="ck2__err">{errors.expiry.message}</p>}
          </div>
          <div className="ck2__row">
            <label className="ck2__label">CVV</label>
            <input placeholder="123" inputMode="numeric" maxLength={4} {...register("cvv")} />
            {errors.cvv && <p className="ck2__err">{errors.cvv.message}</p>}
          </div>

          <div className="ck2__lock">
            <Lock size={12} /> Your card details are encrypted in transit. This is a demo gateway.
          </div>

          <div className="ck2__actions">
            <button type="button" className="tfi-pill tfi-pill--outline" onClick={onBack} disabled={submitting}>
              ← Back to checkout
            </button>
            <button type="submit" className="tfi-pill" disabled={submitting}>
              {submitting ? (
                <><Loader2 size={13} className="animate-spin" /> Placing order…</>
              ) : (
                <><span className="arrow">↳</span>Pay {fmt(total)}</>
              )}
            </button>
          </div>
        </div>

        <aside className="ck2__summary">
          <p className="t-eyebrow ck2__summary-eb"><span className="diamond">◆</span>Order summary</p>
          <dl>
            <div><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
            {appliedPromo && (
              <div className="ck2__discount"><dt>Promo · {appliedPromo.code}</dt><dd>− {fmt(discount)}</dd></div>
            )}
            <div><dt>Delivery</dt><dd>{fmt(delivery)}</dd></div>
            <div><dt>Tax (18%)</dt><dd>{fmt(tax)}</dd></div>
          </dl>
          <div className="ck2__summary-total">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </aside>
      </form>
    </div>
  )
}
