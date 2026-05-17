import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Shop Premium Flooring & Wall Paneling Online UK | TFi Collections" },
  description:
    "Shop TFi Floors and Interiors collections online — premium engineered oak flooring, acoustic and fluted wall panels, microcement, stone surfaces and bespoke kitchen finishes. Filter by brand, category and collection. UK-wide delivery from our Birmingham showroom.",
  keywords: [
    "shop premium flooring online UK",
    "buy engineered oak flooring UK",
    "wall paneling shop online UK",
    "acoustic slat panels for sale",
    "microcement supplier UK",
    "luxury vinyl plank UK",
    "premium flooring collections",
    "wood flooring shop Birmingham",
    "interior surface materials UK",
    "trade flooring online UK",
  ],
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Shop Premium Flooring & Wall Paneling Online UK | TFi Collections",
    description:
      "Engineered oak, acoustic wall panels, microcement and stone — premium UK flooring and paneling collections from TFi.",
    url: "/products",
    type: "website",
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
