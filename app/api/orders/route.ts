import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Order } from "@/lib/models/order"

async function generateOrderNumber(db: Awaited<ReturnType<typeof connectToDatabase>>["db"]): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.collection<Order>("orders").countDocuments()
  const padded = String(count + 1).padStart(4, "0")
  return `TFI-${year}-${padded}`
}

export async function GET(request: NextRequest) {
  try {
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
    const { db } = await connectToDatabase()
    const body = await request.json()

    const now = new Date()
    const orderNumber = await generateOrderNumber(db)

    const order: Omit<Order, "_id"> = {
      orderNumber,
      customer: body.customer,
      items: body.items,
      subtotal: body.subtotal,
      total: body.total,
      status: "pending",
      notes: body.notes || "",
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Order>("orders").insertOne(order as Order)
    return Response.json({ ...order, _id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create order" }, { status: 500 })
  }
}
