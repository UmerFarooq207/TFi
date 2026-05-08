import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { User, UserRole, PublicUser } from "@/lib/models/user"
import { toPublicUser } from "@/lib/models/user"

export const AUTH_COOKIE = "tfi-session"
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not defined")
  return new TextEncoder().encode(secret)
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  role: UserRole
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_LIFETIME_SECONDS}s`)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      payload.role === "admin"
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
    }
    return null
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies()
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_LIFETIME_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
}

export async function getSessionPayload(): Promise<JWTPayload | null> {
  const store = await cookies()
  const token = store.get(AUTH_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const payload = await getSessionPayload()
  if (!payload) return null
  try {
    const { db } = await connectToDatabase()
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(payload.sub) })
    if (!user) return null
    return toPublicUser(user)
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<{
  ok: true
  user: JWTPayload
} | { ok: false; status: number; error: string }> {
  const payload = await getSessionPayload()
  if (!payload) return { ok: false, status: 401, error: "Authentication required" }
  if (payload.role !== "admin") {
    return { ok: false, status: 403, error: "Admin access required" }
  }
  return { ok: true, user: payload }
}

export async function requireUser(): Promise<{
  ok: true
  user: JWTPayload
} | { ok: false; status: number; error: string }> {
  const payload = await getSessionPayload()
  if (!payload) return { ok: false, status: 401, error: "Authentication required" }
  return { ok: true, user: payload }
}
