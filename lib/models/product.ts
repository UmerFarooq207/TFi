import { ObjectId } from "mongodb"

export interface ProductDimensions {
  width: number
  height: number
  thickness: number
  unit: "mm" | "cm" | "m" | "in"
}

export interface ProductPackage {
  unitsPerPackage: number
  unitLabel: string
  areaPerPackage: number
  areaUnit: "m²" | "ft²"
  weightPerPackage: number
  weightUnit: "kg" | "lb"
}

export interface ProductPallet {
  unitsPerPallet: number
  unitLabel: string
  areaPerPallet: number
  areaUnit: "m²" | "ft²"
}

export interface Product {
  _id?: ObjectId | string
  name: string
  slug: string
  brand: string
  category:
    | "flooring"
    | "decorative-furniture-panel"
    | "skirting"
    | "decorative-wall-covering"
    | "furniture-profile"
  collection: string
  description: string
  price: number
  unit: string
  images: string[]
  dimensions: ProductDimensions
  package: ProductPackage
  pallet: ProductPallet
  pattern: string
  color: string
  specs?: { key: string; value: string }[]
  inStock: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = Product["category"]
