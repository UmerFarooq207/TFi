import { ObjectId } from "mongodb"

export type PromoType = "percent" | "fixed"

export interface Promo {
  _id?: ObjectId | string
  code: string
  type: PromoType
  value: number
  minSubtotal?: number
  maxUses?: number
  uses: number
  expiresAt?: Date | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export function calculateDiscount(promo: Promo, subtotal: number): number {
  if (promo.type === "percent") {
    return Math.round((subtotal * promo.value) / 100)
  }
  return Math.min(promo.value, subtotal)
}
