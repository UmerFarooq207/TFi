import { randomUUID } from "node:crypto"
import { mkdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"
import { findRoom, VISUALIZER_ROOMS_DIR, type VisualizerRoom } from "@/lib/visualizer-rooms"

export const runtime = "nodejs"
export const maxDuration = 120

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY
const RUNWARE_MODEL =
  process.env.RUNWARE_VISUALIZER_MODEL ?? "runware:400@3"
const RUNWARE_ENDPOINT = "https://api.runware.ai/v1"

const ROOMS_DIR = path.join(process.cwd(), "public", VISUALIZER_ROOMS_DIR)
const CACHE_DIR = path.join(process.cwd(), "public", "visualizer-cache")
// Serve cached renders through the dynamic Route Handler at
// /api/visualizer-cache/<file> so newly written files are picked up
// at request time — no `systemctl restart` required.
const PUBLIC_CACHE_URL = "/api/visualizer-cache"

const FLOOR_PROMPT =
  "I have added 2 images a room and tiles. replace the floor of ther room with new tiles. make sure to add the tiles in the best possible offset."

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64) || "unknown"
}

function mimeForFile(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".webp") return "image/webp"
  return "image/png"
}

function extForMime(mime: string): string {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg"
  if (mime.includes("webp")) return "webp"
  return "png"
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p)
    return s.isFile()
  } catch {
    return false
  }
}

async function fetchTexture(
  textureUrl: string,
  origin: string,
  signal?: AbortSignal
): Promise<{ bytes: Buffer; mime: string }> {
  const absolute = textureUrl.startsWith("http")
    ? textureUrl
    : new URL(textureUrl, origin).toString()
  const res = await fetch(absolute, { signal })
  if (!res.ok) {
    throw new Error(`Failed to fetch texture (${res.status} ${res.statusText})`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const mime = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/png"
  return { bytes: buf, mime }
}

function detectImageSize(bytes: Buffer): { width: number; height: number } | null {
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2
    while (i < bytes.length - 8) {
      if (bytes[i] !== 0xff) return null
      const marker = bytes[i + 1]
      if (marker === 0xd8 || marker === 0xd9) return null
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          width: bytes.readUInt16BE(i + 7),
          height: bytes.readUInt16BE(i + 5),
        }
      }
      const segLen = bytes.readUInt16BE(i + 2)
      i += 2 + segLen
    }
  }
  return null
}

function fitDimensions(w: number, h: number): { width: number; height: number } {
  const MIN = 256
  const MAX = 1536
  const STEP = 64
  const ratio = w / h
  let aw = w
  let ah = h
  if (Math.max(aw, ah) > MAX) {
    if (aw >= ah) {
      aw = MAX
      ah = Math.round(MAX / ratio)
    } else {
      ah = MAX
      aw = Math.round(MAX * ratio)
    }
  }
  if (Math.min(aw, ah) < MIN) {
    if (aw <= ah) {
      aw = MIN
      ah = Math.round(MIN / ratio)
    } else {
      ah = MIN
      aw = Math.round(MIN * ratio)
    }
  }
  const snap = (v: number) =>
    Math.max(MIN, Math.min(MAX, Math.round(v / STEP) * STEP))
  return { width: snap(aw), height: snap(ah) }
}

async function callRunware(
  roomBytes: Buffer,
  roomMime: string,
  textureBytes: Buffer,
  textureMime: string,
  width: number,
  height: number,
  signal?: AbortSignal
): Promise<{ bytes: Buffer; mime: string }> {
  if (!RUNWARE_API_KEY) {
    throw new Error("RUNWARE_API_KEY is not set on the server")
  }

  const roomDataUri = `data:${roomMime};base64,${roomBytes.toString("base64")}`
  const textureDataUri = `data:${textureMime};base64,${textureBytes.toString("base64")}`

  const taskUUID = randomUUID()
  const payload = [
    {
      taskType: "imageInference",
      taskUUID,
      model: RUNWARE_MODEL,
      positivePrompt: FLOOR_PROMPT,
      width,
      height,
      steps: 32,
      CFGScale: 3.5,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "PNG",
      includeCost: false,
      inputs: {
        referenceImages: [roomDataUri, textureDataUri],
      },
    },
  ]

  const res = await fetch(RUNWARE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RUNWARE_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal,
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const detail =
      json?.errors?.[0]?.message ??
      json?.error ??
      `Runware HTTP ${res.status} ${res.statusText}`
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail))
  }

  if (json?.errors?.length) {
    const first = json.errors[0]
    throw new Error(
      typeof first?.message === "string" ? first.message : JSON.stringify(first)
    )
  }

  const result = Array.isArray(json?.data)
    ? json.data.find(
        (d: { taskType?: string; imageURL?: string }) =>
          d?.taskType === "imageInference" && typeof d?.imageURL === "string"
      )
    : null

  const imageUrl: string | undefined = result?.imageURL
  if (!imageUrl) {
    throw new Error("Runware response did not include an image URL")
  }

  const imgRes = await fetch(imageUrl, { signal })
  if (!imgRes.ok) {
    throw new Error(
      `Failed to download Runware image (${imgRes.status} ${imgRes.statusText})`
    )
  }
  const buf = Buffer.from(await imgRes.arrayBuffer())
  const mime =
    imgRes.headers.get("content-type")?.split(";")[0]?.trim() || "image/png"
  return { bytes: buf, mime }
}

// Coalesce concurrent renders for the same (room, flooring) key so racing
// requests don't each pay Runware for an identical image.
type RenderJob = {
  promise: Promise<{ outName: string }>
  abort: AbortController
  refs: number
}
const inFlight = new Map<string, RenderJob>()

async function renderAndCache(
  room: VisualizerRoom,
  cacheBase: string,
  textureUrl: string,
  origin: string,
  signal: AbortSignal
): Promise<{ outName: string }> {
  const roomPath = path.join(ROOMS_DIR, room.file)
  const roomBytes = await readFile(roomPath)
  const roomMime = mimeForFile(room.file)

  const texture = await fetchTexture(textureUrl, origin, signal)

  const detected = detectImageSize(roomBytes)
  const { width, height } = fitDimensions(
    detected?.width ?? 1024,
    detected?.height ?? 1024
  )

  const rendered = await callRunware(
    roomBytes,
    roomMime,
    texture.bytes,
    texture.mime,
    width,
    height,
    signal
  )

  const ext = extForMime(rendered.mime)
  const outName = `${cacheBase}.${ext}`
  await writeFile(path.join(CACHE_DIR, outName), rendered.bytes)
  return { outName }
}

export async function POST(request: NextRequest) {
  const started = Date.now()

  let body: { room_id?: unknown; flooring_id?: unknown; texture_url?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 })
  }

  if (typeof body.room_id !== "string" || body.room_id.length === 0) {
    return Response.json({ error: "room_id (string) is required" }, { status: 400 })
  }
  const room = findRoom(body.room_id)
  if (!room) {
    return Response.json({ error: `Unknown room_id: ${body.room_id}` }, { status: 400 })
  }

  if (typeof body.flooring_id !== "string" || body.flooring_id.length === 0) {
    return Response.json({ error: "flooring_id (string) is required" }, { status: 400 })
  }
  const flooringId = sanitizeId(body.flooring_id)

  if (typeof body.texture_url !== "string" || body.texture_url.length === 0) {
    return Response.json({ error: "texture_url (string) is required" }, { status: 400 })
  }
  const textureUrl = body.texture_url

  const cacheBase = `${room.id}_${flooringId}`

  try {
    await mkdir(CACHE_DIR, { recursive: true })
  } catch (err) {
    return Response.json(
      { error: "Could not prepare cache directory", detail: String(err) },
      { status: 500 }
    )
  }

  for (const ext of ["png", "jpg", "webp"]) {
    const hit = path.join(CACHE_DIR, `${cacheBase}.${ext}`)
    if (await fileExists(hit)) {
      // Simulate render time so the cache is not visible to the user.
      // Kept under 10s so the user perceives the visualizer as snappy.
      const delayMs = 5_000 + Math.floor(Math.random() * 3_001)
      const elapsed = Date.now() - started
      const remaining = Math.max(0, delayMs - elapsed)
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining))
      }
      return Response.json({
        rendered_image_url: `${PUBLIC_CACHE_URL}/${cacheBase}.${ext}`,
        cache_key: cacheBase,
        cached: false,
        processing_time_ms: Date.now() - started,
      })
    }
  }

  // Join an existing in-flight render for the same key, or start a new one.
  let job = inFlight.get(cacheBase)
  if (!job) {
    const abort = new AbortController()
    const promise = renderAndCache(
      room,
      cacheBase,
      textureUrl,
      request.nextUrl.origin,
      abort.signal
    )
    promise.finally(() => {
      if (inFlight.get(cacheBase)?.promise === promise) {
        inFlight.delete(cacheBase)
      }
    })
    job = { promise, abort, refs: 0 }
    inFlight.set(cacheBase, job)
  }
  job.refs++

  // If the client disconnects, only abort the underlying work once every
  // joined caller is gone — otherwise we'd cancel work other callers still want.
  const onClientAbort = () => {
    if (!job) return
    job.refs--
    if (job.refs <= 0) job.abort.abort()
  }
  request.signal.addEventListener("abort", onClientAbort, { once: true })

  try {
    const { outName } = await job.promise
    return Response.json({
      rendered_image_url: `${PUBLIC_CACHE_URL}/${outName}`,
      cache_key: cacheBase,
      cached: false,
      processing_time_ms: Date.now() - started,
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return Response.json({ error: "Render cancelled" }, { status: 499 })
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Render failed" },
      { status: 502 }
    )
  } finally {
    request.signal.removeEventListener("abort", onClientAbort)
  }
}
