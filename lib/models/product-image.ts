import type { ObjectId } from "mongodb"

export interface ProductImage {
  _id?: ObjectId | string
  filename: string
  contentType: string
  data: Buffer
  size: number
  createdAt: Date
}

