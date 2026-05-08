import { ObjectId } from "mongodb"
import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product, ProductDimensions, ProductPackage, ProductPallet } from "@/lib/models/product"
import type { ProductImage } from "@/lib/models/product-image"
import { requireAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ slug: string }> }

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

function pickDimensions(input: unknown, fallback: ProductDimensions): ProductDimensions {
  if (!input || typeof input !== "object") return fallback
  const d = input as Record<string, unknown>
  const unit = (DIM_UNITS as readonly string[]).includes(String(d.unit)) ? (d.unit as DimUnit) : fallback.unit
  return {
    width: num(d.width),
    height: num(d.height),
    thickness: num(d.thickness),
    unit,
  }
}

function pickPackage(input: unknown, fallback: ProductPackage): ProductPackage {
  if (!input || typeof input !== "object") return fallback
  const p = input as Record<string, unknown>
  const areaUnit = (AREA_UNITS as readonly string[]).includes(String(p.areaUnit)) ? (p.areaUnit as AreaUnit) : fallback.areaUnit
  const weightUnit = (WEIGHT_UNITS as readonly string[]).includes(String(p.weightUnit)) ? (p.weightUnit as WeightUnit) : fallback.weightUnit
  return {
    unitsPerPackage: num(p.unitsPerPackage),
    unitLabel: typeof p.unitLabel === "string" ? p.unitLabel : fallback.unitLabel,
    areaPerPackage: num(p.areaPerPackage),
    areaUnit,
    weightPerPackage: num(p.weightPerPackage),
    weightUnit,
  }
}

function pickPallet(input: unknown, fallback: ProductPallet): ProductPallet {
  if (!input || typeof input !== "object") return fallback
  const p = input as Record<string, unknown>
  const areaUnit = (AREA_UNITS as readonly string[]).includes(String(p.areaUnit)) ? (p.areaUnit as AreaUnit) : fallback.areaUnit
  return {
    unitsPerPallet: num(p.unitsPerPallet),
    unitLabel: typeof p.unitLabel === "string" ? p.unitLabel : fallback.unitLabel,
    areaPerPallet: num(p.areaPerPallet),
    areaUnit,
  }
}

function isStoredImageId(value: string): boolean {
  return ObjectId.isValid(value) && !value.startsWith("http://") && !value.startsWith("https://") && !value.startsWith("/")
}

async function deleteUnusedStoredImages(images: string[]) {
  const storedIds = images.filter(isStoredImageId)
  if (storedIds.length === 0) return

  const { db } = await connectToDatabase()
  const idsToDelete: ObjectId[] = []

  for (const id of storedIds) {
    const stillUsed = await db
      .collection<Product>("products")
      .countDocuments({ images: id })
    if (stillUsed === 0) {
      idsToDelete.push(new ObjectId(id))
    }
  }

  if (idsToDelete.length > 0) {
    await db.collection<ProductImage>("product_images").deleteMany({ _id: { $in: idsToDelete } })
  }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { slug } = await ctx.params
    const { db } = await connectToDatabase()

    const product = await db.collection<Product>("products").findOne({ slug })
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }
    return Response.json(product)
  } catch {
    return Response.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { slug } = await ctx.params
    const { db } = await connectToDatabase()
    const body = await request.json()
    const existing = await db.collection<Product>("products").findOne({ slug })
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }

    const update: Partial<Product> & { updatedAt: Date } = {
      name: typeof body.name === "string" ? body.name.trim() : existing.name,
      brand: typeof body.brand === "string" ? body.brand.trim() : existing.brand,
      category: body.category ?? existing.category,
      collection: typeof body.collection === "string" ? body.collection.trim() : existing.collection,
      description: typeof body.description === "string" ? body.description.trim() : existing.description,
      price: body.price !== undefined ? num(body.price) : existing.price,
      unit: typeof body.unit === "string" ? body.unit.trim() : existing.unit,
      images: Array.isArray(body.images)
        ? body.images.filter((value: unknown): value is string => typeof value === "string")
        : existing.images,
      dimensions: pickDimensions(body.dimensions, existing.dimensions),
      package: pickPackage(body.package, existing.package),
      pallet: pickPallet(body.pallet, existing.pallet),
      pattern: typeof body.pattern === "string" ? body.pattern.trim() : existing.pattern,
      color: typeof body.color === "string" ? body.color.trim() : existing.color,
      specs: Array.isArray(body.specs) ? body.specs : existing.specs,
      inStock: typeof body.inStock === "boolean" ? body.inStock : existing.inStock,
      featured: typeof body.featured === "boolean" ? body.featured : existing.featured,
      updatedAt: new Date(),
    }

    const result = await db.collection<Product>("products").findOneAndUpdate(
      { slug },
      { $set: update },
      { returnDocument: "after" }
    )

    const newImages = update.images ?? existing.images
    const removedImages = existing.images.filter((image) => !newImages.includes(image))
    await deleteUnusedStoredImages(removedImages)

    return Response.json(result)
  } catch {
    return Response.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }
    const { slug } = await ctx.params
    const { db } = await connectToDatabase()
    const existing = await db.collection<Product>("products").findOne({ slug })
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }

    const result = await db.collection<Product>("products").deleteOne({ slug })
    if (result.deletedCount > 0) {
      await deleteUnusedStoredImages(existing.images)
    }
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
