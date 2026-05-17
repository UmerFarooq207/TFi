import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Order Confirmed | TFi Floors and Interiors UK" },
  description:
    "Thank you for your TFi Floors and Interiors order — our UK team will confirm delivery and installation details shortly.",
  alternates: { canonical: "/order-confirmed" },
  robots: { index: false, follow: false },
}

export default function OrderConfirmedLayout({ children }: { children: React.ReactNode }) {
  return children
}
