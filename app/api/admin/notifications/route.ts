import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { db } = await connectToDatabase()
    const sp = request.nextUrl.searchParams

    const sinceOrders = Number(sp.get("sinceOrders")) || 0
    const sinceInquiries = Number(sp.get("sinceInquiries")) || 0

    const [newOrders, newInquiries] = await Promise.all([
      db.collection("orders").countDocuments({
        createdAt: { $gt: new Date(sinceOrders) },
      }),
      db.collection("inquiries").countDocuments({
        createdAt: { $gt: new Date(sinceInquiries) },
      }),
    ])

    return Response.json({ newOrders, newInquiries })
  } catch {
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
