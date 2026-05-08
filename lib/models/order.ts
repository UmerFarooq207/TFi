import { ObjectId } from "mongodb"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "delivered"
  | "cancelled"

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface OrderPromo {
  code: string
  type: "percent" | "fixed"
  value: number
  discount: number
}

export interface Order {
  _id?: ObjectId | string
  orderNumber: string
  userId?: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
  }
  items: OrderItem[]
  subtotal: number
  discount?: number
  promo?: OrderPromo
  total: number
  status: OrderStatus
  notes: string
  createdAt: Date
  updatedAt: Date
}
