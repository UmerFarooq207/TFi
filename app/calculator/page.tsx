import type { Metadata } from "next"
import { Suspense } from "react"
import { Calculator } from "./calculator"

export const metadata: Metadata = {
  title: { absolute: "Free Flooring & Paneling Cost Estimate Calculator UK | TFi" },
  description:
    "Free online cost estimate calculator from TFi Floors and Interiors — price up your engineered oak flooring, acoustic wall paneling, microcement or bespoke kitchen project in three simple steps. UK delivery and installation costs included, no sales calls required.",
  keywords: [
    "free flooring cost calculator UK",
    "wall paneling price estimate UK",
    "engineered oak price per square metre",
    "microcement cost UK",
    "kitchen quote calculator UK",
    "TFi estimate tool",
    "interior project cost estimator",
    "flooring installation cost UK",
  ],
  alternates: { canonical: "/calculator" },
  openGraph: {
    title: "Free Flooring & Paneling Cost Estimate Calculator UK | TFi",
    description:
      "Estimate flooring, wall paneling, microcement or kitchen project costs in three simple steps — TFi Floors and Interiors UK.",
    url: "/calculator",
    type: "website",
  },
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <Calculator />
    </Suspense>
  )
}
