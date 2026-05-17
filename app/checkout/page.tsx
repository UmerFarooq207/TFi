import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: { absolute: "Checkout | TFi Floors and Interiors UK" },
  description:
    "Secure checkout for TFi Floors and Interiors UK — premium flooring, wall paneling and bespoke kitchen orders.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
}

export default function CheckoutRedirect() {
  redirect("/cart")
}
