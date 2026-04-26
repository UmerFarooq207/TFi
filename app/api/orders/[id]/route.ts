import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { Order } from "@/lib/models/order"
import { requireAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await ctx.params
    const { db } = await connectToDatabase()

    const order = await db
      .collection<Order>("orders")
      .findOne({ _id: new ObjectId(id) })

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }
    return Response.json(order)
  } catch {
    return Response.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await ctx.params
    const { db } = await connectToDatabase()
    const body = await request.json()

    const update = { ...body, updatedAt: new Date() }
    delete update._id

    const result = await db
      .collection<Order>("orders")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      )

    if (!result) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }
    return Response.json(result)
  } catch {
    return Response.json({ error: "Failed to update order" }, { status: 500 })
  }
}
