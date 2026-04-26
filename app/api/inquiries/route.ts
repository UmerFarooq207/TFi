import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Inquiry } from "@/lib/models/inquiry"
import { requireAdmin } from "@/lib/auth"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    const inquiries = await db
      .collection<Inquiry>("inquiries")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json(inquiries)
  } catch {
    return Response.json({ error: "Failed to fetch inquiries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined
    const service = typeof body.service === "string" ? body.service.trim() : undefined

    if (name.length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }
    if (!EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Please provide a valid email" }, { status: 400 })
    }
    if (message.length < 5) {
      return Response.json({ error: "Message is too short" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const now = new Date()
    const inquiry: Omit<Inquiry, "_id"> = {
      name,
      email,
      phone,
      service,
      message,
      status: "new",
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Inquiry>("inquiries").insertOne(inquiry as Inquiry)
    return Response.json({ ...inquiry, _id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to submit inquiry" }, { status: 500 })
  }
}
