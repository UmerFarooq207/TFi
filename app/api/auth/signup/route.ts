import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/user"
import { toPublicUser } from "@/lib/models/user"
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined

    if (name.length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }
    if (!EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Please provide a valid email" }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const existing = await db.collection<User>("users").findOne({ email })
    if (existing) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const now = new Date()
    const userDoc: Omit<User, "_id"> = {
      name,
      email,
      passwordHash,
      role: "customer",
      phone,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<User>("users").insertOne(userDoc as User)
    const created: User = { ...userDoc, _id: result.insertedId }

    const token = await signToken({
      sub: String(result.insertedId),
      email: created.email,
      name: created.name,
      role: created.role,
    })
    await setSessionCookie(token)

    return Response.json({ user: toPublicUser(created) }, { status: 201 })
  } catch (error) {
    console.error("Signup failed:", error)
    return Response.json({ error: "Failed to create account" }, { status: 500 })
  }
}
