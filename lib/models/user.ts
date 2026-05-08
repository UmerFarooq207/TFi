import type { ObjectId } from "mongodb"

export type UserRole = "admin"

export interface User {
  _id?: ObjectId | string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export type PublicUser = Omit<User, "passwordHash">

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _omit, ...rest } = user
  void _omit
  return { ...rest, _id: user._id ? String(user._id) : undefined }
}
