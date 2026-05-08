import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/user"
import { toPublicUser } from "@/lib/models/user"
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection<User>("users").findOne({ email })
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return Response.json({ error: "This sign-in is for administrators only" }, { status: 403 })
    }

    const token = await signToken({
      sub: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    })
    await setSessionCookie(token)

    return Response.json({ user: toPublicUser(user) })
  } catch (error) {
    console.error("Login failed:", error)
    return Response.json({ error: "Failed to log in" }, { status: 500 })
  }
}
