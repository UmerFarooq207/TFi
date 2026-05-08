import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Order, OrderPromo } from "@/lib/models/order"
import type { Promo } from "@/lib/models/promo"
import { calculateDiscount } from "@/lib/models/promo"
import { requireAdmin, requireUser } from "@/lib/auth"

async function generateOrderNumber(db: Awaited<ReturnType<typeof connectToDatabase>>["db"]): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.collection<Order>("orders").countDocuments()
  const padded = String(count + 1).padStart(4, "0")
  return `TFI-${year}-${padded}`
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { db } = await connectToDatabase()
    const { searchParams } = request.nextUrl

    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ]
    }

    const orders = await db
      .collection<Order>("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json(orders)
  } catch {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { db } = await connectToDatabase()
    const body = await request.json()

    const subtotal = Number(body.subtotal) || 0
    let discount = 0
    let promoMeta: OrderPromo | undefined
    let validatedPromo: Promo | null = null

    if (body.promoCode) {
      const code = String(body.promoCode).trim().toUpperCase()
      validatedPromo = await db.collection<Promo>("promos").findOne({ code })
      if (!validatedPromo) {
        return Response.json({ error: "Invalid promo code" }, { status: 400 })
      }
      if (!validatedPromo.active) {
        return Response.json({ error: "Promo is not active" }, { status: 400 })
      }
      if (validatedPromo.expiresAt && new Date(validatedPromo.expiresAt).getTime() < Date.now()) {
        return Response.json({ error: "Promo has expired" }, { status: 400 })
      }
      if (validatedPromo.maxUses && validatedPromo.uses >= validatedPromo.maxUses) {
        return Response.json({ error: "Promo has reached its usage limit" }, { status: 400 })
      }
      if (validatedPromo.minSubtotal && subtotal < validatedPromo.minSubtotal) {
        return Response.json({ error: "Subtotal too low for this promo" }, { status: 400 })
      }
      discount = calculateDiscount(validatedPromo, subtotal)
      promoMeta = {
        code: validatedPromo.code,
        type: validatedPromo.type,
        value: validatedPromo.value,
        discount,
      }
    }

    const now = new Date()
    const orderNumber = await generateOrderNumber(db)

    const order: Omit<Order, "_id"> = {
      orderNumber,
      userId: auth.user.sub,
      customer: body.customer,
      items: body.items,
      subtotal,
      discount: discount > 0 ? discount : undefined,
      promo: promoMeta,
      total: Number(body.total) || 0,
      status: "pending",
      notes: body.notes || "",
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Order>("orders").insertOne(order as Order)

    if (validatedPromo) {
      await db.collection<Promo>("promos").updateOne(
        { _id: validatedPromo._id },
        { $inc: { uses: 1 }, $set: { updatedAt: now } }
      )
    }

    return Response.json({ ...order, _id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create order" }, { status: 500 })
  }
}
