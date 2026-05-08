import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product, ProductDimensions, ProductPackage, ProductPallet } from "@/lib/models/product"
import { requireAdmin } from "@/lib/auth"

const DIM_UNITS = ["mm", "cm", "m", "in"] as const
const AREA_UNITS = ["m²", "ft²"] as const
const WEIGHT_UNITS = ["kg", "lb"] as const

type DimUnit = (typeof DIM_UNITS)[number]
type AreaUnit = (typeof AREA_UNITS)[number]
type WeightUnit = (typeof WEIGHT_UNITS)[number]

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function pickDimensions(input: unknown): ProductDimensions {
  const d = (input ?? {}) as Record<string, unknown>
  const unit = (DIM_UNITS as readonly string[]).includes(String(d.unit)) ? (d.unit as DimUnit) : "mm"
  return {
    width: num(d.width),
    height: num(d.height),
    thickness: num(d.thickness),
    unit,
  }
}

function pickPackage(input: unknown): ProductPackage {
  const p = (input ?? {}) as Record<string, unknown>
  const areaUnit = (AREA_UNITS as readonly string[]).includes(String(p.areaUnit)) ? (p.areaUnit as AreaUnit) : "m²"
  const weightUnit = (WEIGHT_UNITS as readonly string[]).includes(String(p.weightUnit)) ? (p.weightUnit as WeightUnit) : "kg"
  return {
    unitsPerPackage: num(p.unitsPerPackage),
    unitLabel: typeof p.unitLabel === "string" ? p.unitLabel : "Piece",
    areaPerPackage: num(p.areaPerPackage),
    areaUnit,
    weightPerPackage: num(p.weightPerPackage),
    weightUnit,
  }
}

function pickPallet(input: unknown): ProductPallet {
  const p = (input ?? {}) as Record<string, unknown>
  const areaUnit = (AREA_UNITS as readonly string[]).includes(String(p.areaUnit)) ? (p.areaUnit as AreaUnit) : "m²"
  return {
    unitsPerPallet: num(p.unitsPerPallet),
    unitLabel: typeof p.unitLabel === "string" ? p.unitLabel : "Piece",
    areaPerPallet: num(p.areaPerPallet),
    areaUnit,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = request.nextUrl

    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const limit = Number(searchParams.get("limit") ?? 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (category) query.category = category
    if (featured === "true") query.featured = true
    const brand = searchParams.get("brand")
    const collection = searchParams.get("collection")
    if (brand) query.brand = brand
    if (collection) query.collection = collection
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { collection: { $regex: search, $options: "i" } },
        { pattern: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ]
    }

    let cursor = db
      .collection<Product>("products")
      .find(query)
      .sort({ createdAt: -1 })
    if (limit > 0) cursor = cursor.limit(limit)
    const products = await cursor.toArray()

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
      name: String(body.name ?? "").trim(),
      slug,
      brand: String(body.brand ?? "").trim(),
      category: body.category,
      collection: String(body.collection ?? "").trim(),
      description: String(body.description ?? "").trim(),
      price: num(body.price),
      unit: String(body.unit ?? "").trim(),
      images: Array.isArray(body.images)
        ? body.images.filter((value: unknown): value is string => typeof value === "string")
        : [],
      dimensions: pickDimensions(body.dimensions),
      package: pickPackage(body.package),
      pallet: pickPallet(body.pallet),
      pattern: String(body.pattern ?? "").trim(),
      color: String(body.color ?? "").trim(),
      specs: Array.isArray(body.specs) ? body.specs : [],
      inStock: Boolean(body.inStock),
      featured: Boolean(body.featured),
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Product>("products").insertOne(product as Product)
    return Response.json({ ...product, _id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create product" }, { status: 500 })
  }
}
