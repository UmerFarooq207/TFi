import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { Inquiry } from "@/lib/models/inquiry"
import { requireAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await ctx.params
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid inquiry id" }, { status: 400 })
    }
    const { db } = await connectToDatabase()

    const inquiry = await db
      .collection<Inquiry>("inquiries")
      .findOne({ _id: new ObjectId(id) })

    if (!inquiry) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 })
    }
    return Response.json(inquiry)
  } catch {
    return Response.json({ error: "Failed to fetch inquiry" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { id } = await ctx.params
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid inquiry id" }, { status: 400 })
    }
    const { db } = await connectToDatabase()
    const body = await request.json()

    const update = { ...body, updatedAt: new Date() }
    delete update._id

    const result = await db
      .collection<Inquiry>("inquiries")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      )

    if (!result) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 })
    }
    return Response.json(result)
  } catch {
    return Response.json({ error: "Failed to update inquiry" }, { status: 500 })
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
      return Response.json({ error: "Invalid inquiry id" }, { status: 400 })
    }
    const { db } = await connectToDatabase()
    const result = await db
      .collection<Inquiry>("inquiries")
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Failed to delete inquiry" }, { status: 500 })
  }
}
