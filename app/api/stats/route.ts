import { connectToDatabase } from "@/lib/mongodb"
import type { Order } from "@/lib/models/order"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { db } = await connectToDatabase()

    const [totalProducts, totalOrders, pendingOrders, revenueAgg] =
      await Promise.all([
        db.collection("products").countDocuments(),
        db.collection("orders").countDocuments(),
        db.collection<Order>("orders").countDocuments({ status: "pending" }),
        db
          .collection<Order>("orders")
          .aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ])
          .toArray(),
      ])

    return Response.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: revenueAgg[0]?.total ?? 0,
    })
  } catch {
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
