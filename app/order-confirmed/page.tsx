"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function OrderConfirmedContent() {
  const params = useSearchParams()
  const orderNumber = params.get("orderNumber") ?? ""
  const name = params.get("name") ?? "valued customer"

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-8"
      >
        <CheckCircle2 size={64} className="text-accent" strokeWidth={1.5} />
      </motion.div>

      {/* Animated dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent/20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 300],
              y: [0, (Math.random() - 0.5) * 300],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut",
            }}
            style={{
              left: "50%",
              top: "50%",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="space-y-4 max-w-lg"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-accent">
          Order Confirmed
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
          Order Placed Successfully
        </h1>

        {orderNumber && (
          <div className="inline-block border border-border/40 px-6 py-3 my-2">
            <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/60 mb-1">
              Order Number
            </p>
            <p className="font-heading text-xl font-medium text-accent tracking-wider">
              {orderNumber}
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Thank you{name ? `, ${name}` : ""}. Your order has been received and our team will
          contact you shortly to confirm delivery details.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            asChild
            className="px-8 h-11 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0"
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="px-8 h-11 text-xs tracking-[0.2em] uppercase border-border/50 text-muted-foreground hover:text-foreground"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  )
}
