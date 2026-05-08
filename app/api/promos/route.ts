import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Promo } from "@/lib/models/promo"
import { requireAdmin } from "@/lib/auth"

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { db } = await connectToDatabase()
    const promos = await db
      .collection<Promo>("promos")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    return Response.json(promos)
  } catch {
    return Response.json({ error: "Failed to fetch promos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const code = String(body.code ?? "").trim().toUpperCase()
    const type = body.type === "fixed" ? "fixed" : "percent"
    const value = num(body.value)

    if (!code) return Response.json({ error: "Code is required" }, { status: 400 })
    if (value <= 0) return Response.json({ error: "Discount value must be positive" }, { status: 400 })
    if (type === "percent" && value > 100) {
      return Response.json({ error: "Percentage cannot exceed 100" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const existing = await db.collection<Promo>("promos").findOne({ code })
    if (existing) {
      return Response.json({ error: "A promo with this code already exists" }, { status: 409 })
    }

    const minSubtotal = body.minSubtotal !== undefined && body.minSubtotal !== null && body.minSubtotal !== ""
      ? num(body.minSubtotal)
      : undefined
    const maxUses = body.maxUses !== undefined && body.maxUses !== null && body.maxUses !== ""
      ? Math.max(1, Math.floor(num(body.maxUses)))
      : undefined
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

    const now = new Date()
    const promo: Omit<Promo, "_id"> = {
      code,
      type,
      value,
      minSubtotal,
      maxUses,
      uses: 0,
      expiresAt,
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Promo>("promos").insertOne(promo as Promo)
    return Response.json({ ...promo, _id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create promo" }, { status: 500 })
  }
}
