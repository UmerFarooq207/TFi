import type { ObjectId } from "mongodb"

export type InquiryStatus = "new" | "in-progress" | "resolved" | "archived"

export interface Inquiry {
  _id?: ObjectId | string
  name: string
  email: string
  phone?: string
  service?: string
  message: string
  status: InquiryStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}
