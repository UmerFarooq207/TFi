import { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId | string
  name: string
  slug: string
  category: "flooring" | "wall-paneling" | "kitchen"
  subcategory: string
  description: string
  price: number
  unit: string
  images: string[]
  specs: { key: string; value: string }[]
  inStock: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = Product["category"]
