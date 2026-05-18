import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Your Cart | TFi Floors and Interiors UK" },
  description:
    "Review your flooring, wall paneling and surface selections from TFi Floors and Interiors. Secure checkout, nationwide UK delivery and 15-year manufacturer warranties on commercial ranges.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
