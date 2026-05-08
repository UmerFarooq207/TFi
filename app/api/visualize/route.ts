import { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 120

const VISUALIZER_API_URL =
  process.env.VISUALIZER_API_URL ?? "http://localhost:8000"

const ALLOWED_SURFACES = new Set(["floor", "wall", "ceiling"])

async function urlToFile(url: string, fallbackName: string, origin: string): Promise<File> {
  const absolute = url.startsWith("http") ? url : new URL(url, origin).toString()
  const res = await fetch(absolute)
  if (!res.ok) {
    throw new Error(`Failed to fetch texture (${res.status} ${res.statusText})`)
  }
  const blob = await res.blob()
  const contentType = blob.type || "image/png"
  const ext = contentType.split("/")[1]?.split(";")[0] ?? "png"
  return new File([blob], `${fallbackName}.${ext}`, { type: contentType })
}

export async function POST(request: NextRequest) {
  let inbound: FormData
  try {
    inbound = await request.formData()
  } catch {
    return Response.json({ error: "Expected multipart/form-data body" }, { status: 400 })
  }

  const roomImage = inbound.get("room_image")
  if (!(roomImage instanceof File)) {
    return Response.json({ error: "room_image (file) is required" }, { status: 400 })
  }

  const textureFile = inbound.get("texture_image")
  const textureUrl = inbound.get("texture_url")

  let textureToSend: File
  try {
    if (textureFile instanceof File) {
      textureToSend = textureFile
    } else if (typeof textureUrl === "string" && textureUrl.length > 0) {
      textureToSend = await urlToFile(textureUrl, "texture", request.nextUrl.origin)
    } else {
      return Response.json(
        { error: "texture_image (file) or texture_url (string) is required" },
        { status: 400 }
      )
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to load texture" },
      { status: 400 }
    )
  }

  const targetSurface = String(inbound.get("target_surface") ?? "floor").toLowerCase()
  if (!ALLOWED_SURFACES.has(targetSurface)) {
    return Response.json(
      { error: `Unsupported target_surface '${targetSurface}'` },
      { status: 400 }
    )
  }

  const outbound = new FormData()
  outbound.set("room_image", roomImage, roomImage.name || "room.png")
  outbound.set("texture_image", textureToSend, textureToSend.name || "texture.png")
  outbound.set("target_surface", targetSurface)

  const passThrough = [
    "tile_scale",
    "rotation_degrees",
    "blend_strength",
    "preserve_lighting",
    "use_sam2_refine",
    "fill_enclosed_holes",
  ] as const

  for (const key of passThrough) {
    const value = inbound.get(key)
    if (value !== null) outbound.set(key, String(value))
  }

  let upstream: Response
  try {
    upstream = await fetch(`${VISUALIZER_API_URL}/api/v1/render`, {
      method: "POST",
      body: outbound,
    })
  } catch (err) {
    return Response.json(
      {
        error: "Visualizer service is unreachable. Make sure the Python backend is running.",
        detail: err instanceof Error ? err.message : String(err),
        backend: VISUALIZER_API_URL,
      },
      { status: 502 }
    )
  }

  const contentType = upstream.headers.get("content-type") ?? "application/json"
  const body = await upstream.text()

  return new Response(body, {
    status: upstream.status,
    headers: { "content-type": contentType },
  })
}
