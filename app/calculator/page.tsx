import type { Metadata } from "next"
import { Calculator } from "./calculator"

export const metadata: Metadata = {
  title: "Estimate calculator",
  description:
    "Estimate the cost of your TFi project — flooring, panels, or surfaces — in seconds.",
}

export default function CalculatorPage() {
  return <Calculator />
}
