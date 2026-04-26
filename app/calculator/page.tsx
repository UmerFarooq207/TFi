import type { Metadata } from "next"
import { Calculator } from "./calculator"

export const metadata: Metadata = {
  title: "Cost Calculator",
  description:
    "Estimate the cost of your TFi project — flooring, wall paneling, or kitchen surfaces — in seconds.",
}

export default function CalculatorPage() {
  return (
    <div
      className="min-h-screen pt-28 pb-24"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 80% 35%, oklch(0.18 0.018 60 / 0.55), transparent 60%), oklch(0.09 0.006 55)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="mb-10 lg:mb-14 max-w-2xl">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">
            Phase 5a · Cost Calculator
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-medium text-foreground leading-[0.98] tracking-tight">
            Estimate before
            <span className="block italic text-foreground/30">you commit</span>
          </h1>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            Enter your room size, choose the material, and adjust the quantity slider for
            wastage allowance. Pricing updates in real time, and you can drop the result
            straight into your cart.
          </p>
        </div>
        <Calculator />
      </div>
    </div>
  )
}
