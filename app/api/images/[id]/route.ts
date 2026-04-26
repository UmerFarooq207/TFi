import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { ProductImage } from "@/lib/models/product-image"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid image id" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const image = await db
      .collection<ProductImage>("product_images")
      .findOne({ _id: new ObjectId(id) })

    if (!image) {
      return Response.json({ error: "Image not found" }, { status: 404 })
    }

    const rawData = image.data as unknown
    let bytes: Uint8Array

    if (Buffer.isBuffer(rawData)) {
      bytes = rawData
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "buffer" in rawData &&
      (rawData as { buffer: unknown }).buffer instanceof Uint8Array
    ) {
      bytes = (rawData as { buffer: Uint8Array }).buffer
    } else {
      return Response.json({ error: "Invalid image data" }, { status: 500 })
    }

    const payload = Buffer.from(bytes)

    return new Response(payload, {
      headers: {
        "Content-Type": image.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return Response.json({ error: "Failed to load image" }, { status: 500 })
  }
}

