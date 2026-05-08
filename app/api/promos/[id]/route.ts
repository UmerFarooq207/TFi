import { ObjectId } from "mongodb"
import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Promo } from "@/lib/models/promo"
import { requireAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await ctx.params
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid promo id" }, { status: 400 })
    }
    const body = await request.json()
    const { db } = await connectToDatabase()

    const set: Partial<Promo> & { updatedAt: Date } = { updatedAt: new Date() }
    if (typeof body.active === "boolean") set.active = body.active

    const result = await db.collection<Promo>("promos").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: set },
      { returnDocument: "after" }
    )
    if (!result) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(result)
  } catch {
    return Response.json({ error: "Failed to update promo" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await ctx.params
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid promo id" }, { status: 400 })
    }
    const { db } = await connectToDatabase()
    const result = await db.collection<Promo>("promos").deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Failed to delete promo" }, { status: 500 })
  }
}
