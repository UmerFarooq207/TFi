import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/user"
import { hashPassword } from "@/lib/auth"

const DEFAULT_ADMIN = {
  name: "TFi Admin",
  email: "admin@tfi.pk",
  password: "tfiadmin123",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : DEFAULT_ADMIN.name
    const email = typeof body.email === "string" && body.email.trim()
      ? body.email.trim().toLowerCase()
      : DEFAULT_ADMIN.email
    const password = typeof body.password === "string" && body.password.length >= 6
      ? body.password
      : DEFAULT_ADMIN.password

    const { db } = await connectToDatabase()
    const existing = await db.collection<User>("users").findOne({ email })
    if (existing) {
      if (existing.role === "admin") {
        return Response.json({ message: "Admin account already exists", email })
      }
      await db.collection<User>("users").updateOne(
        { _id: existing._id },
        { $set: { role: "admin", updatedAt: new Date() } }
      )
      return Response.json({ message: "Existing user upgraded to admin", email })
    }

    const now = new Date()
    const passwordHash = await hashPassword(password)
    await db.collection<User>("users").insertOne({
      name,
      email,
      passwordHash,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    } as User)

    return Response.json({
      message: "Admin account created",
      email,
      defaultPassword: password === DEFAULT_ADMIN.password ? DEFAULT_ADMIN.password : undefined,
    }, { status: 201 })
  } catch (error) {
    console.error("Seed admin failed:", error)
    return Response.json({ error: "Failed to seed admin account" }, { status: 500 })
  }
}
