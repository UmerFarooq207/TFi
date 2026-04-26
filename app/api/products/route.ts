import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = request.nextUrl

    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (category) query.category = category
    if (featured === "true") query.featured = true
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
      ]
    }

    const products = await db
      .collection<Product>("products")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json(products)
  } catch {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { db } = await connectToDatabase()
    const body = await request.json()

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const now = new Date()
    const product: Omit<Product, "_id"> = {
      ...body,
      images: Array.isArray(body.images) ? body.images.filter((value: unknown): value is string => typeof value === "string") : [],
      slug,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Product>("products").insertOne(product as Product)
    return Response.json({ ...product, _id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create product" }, { status: 500 })
  }
}
