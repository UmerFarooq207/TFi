import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { calculateDiscount, type Promo } from "@/lib/models/promo"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = String(body.code ?? "").trim().toUpperCase()
    const subtotal = typeof body.subtotal === "number" ? body.subtotal : Number(body.subtotal)

    if (!code) {
      return Response.json({ error: "Promo code required" }, { status: 400 })
    }
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return Response.json({ error: "Cart subtotal required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const promo = await db.collection<Promo>("promos").findOne({ code })
    if (!promo) {
      return Response.json({ error: "Invalid promo code" }, { status: 404 })
    }
    if (!promo.active) {
      return Response.json({ error: "This promo is no longer active" }, { status: 400 })
    }
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
      return Response.json({ error: "This promo has expired" }, { status: 400 })
    }
    if (promo.maxUses && promo.uses >= promo.maxUses) {
      return Response.json({ error: "This promo has reached its usage limit" }, { status: 400 })
    }
    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
      return Response.json(
        { error: `Subtotal must be at least £${promo.minSubtotal.toLocaleString("en-GB")}` },
        { status: 400 }
      )
    }

    const discount = calculateDiscount(promo, subtotal)
    return Response.json({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount,
    })
  } catch {
    return Response.json({ error: "Failed to validate promo" }, { status: 500 })
  }
}
