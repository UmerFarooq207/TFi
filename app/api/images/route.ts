import { connectToDatabase } from "@/lib/mongodb"
import type { ProductImage } from "@/lib/models/product-image"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
])

function resolveImageContentType(file: File): string | null {
  const normalizedType = file.type.toLowerCase()
  if (ALLOWED_IMAGE_TYPES.has(normalizedType)) {
    return normalizedType === "image/jpg" ? "image/jpeg" : normalizedType
  }

  const filename = file.name.toLowerCase()
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg"
  if (filename.endsWith(".png")) return "image/png"
  if (filename.endsWith(".webp")) return "image/webp"
  if (filename.endsWith(".gif")) return "image/gif"

  return null
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return Response.json({ error: "Image file is required" }, { status: 400 })
    }

    const contentType = resolveImageContentType(file)
    if (!contentType) {
      return Response.json(
        { error: "Only JPG, JPEG, PNG, WEBP, and GIF files are allowed" },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: "Image is too large. Maximum size is 8MB." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const data = Buffer.from(arrayBuffer)

    const { db } = await connectToDatabase()
    const imageDoc: Omit<ProductImage, "_id"> = {
      filename: file.name || "upload",
      contentType,
      data,
      size: file.size,
      createdAt: new Date(),
    }

    const result = await db
      .collection<ProductImage>("product_images")
      .insertOne(imageDoc as ProductImage)

    return Response.json(
      {
        id: String(result.insertedId),
        url: `/api/images/${String(result.insertedId)}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Image upload failed:", error)
    return Response.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

