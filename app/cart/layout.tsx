import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Your Cart | TFi Floors and Interiors UK" },
  description:
    "Review your flooring, wall paneling and surface selections from TFi Floors and Interiors. Secure UK checkout with 15-year commercial warranty and FSC certified materials.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
