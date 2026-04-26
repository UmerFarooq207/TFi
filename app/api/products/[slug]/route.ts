import { ObjectId } from "mongodb"
import { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import type { ProductImage } from "@/lib/models/product-image"
import { requireAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ slug: string }> }

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

    const update = {
      ...body,
      images: Array.isArray(body.images)
        ? body.images.filter((value: unknown): value is string => typeof value === "string")
        : existing.images,
      updatedAt: new Date(),
    }
    delete update._id

    const result = await db.collection<Product>("products").findOneAndUpdate(
      { slug },
      { $set: update },
      { returnDocument: "after" }
    )

    const removedImages = existing.images.filter((image) => !update.images.includes(image))
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
