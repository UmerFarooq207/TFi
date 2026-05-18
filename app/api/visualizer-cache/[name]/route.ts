import { readFile, stat } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"
// Force this route to run per-request — never let Next.js / a CDN cache
// a 404 for a file that hasn't been generated yet. Once the visualizer
// writes the cache file to disk, the next request picks it up
// immediately, with no server restart needed.
export const dynamic = "force-dynamic"
export const revalidate = 0

const CACHE_DIR = path.join(process.cwd(), "public", "visualizer-cache")

function mimeForFile(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".webp") return "image/webp"
  return "image/png"
}

type Ctx = { params: Promise<{ name: string }> }

export async function GET(_request: Request, ctx: Ctx) {
  const { name } = await ctx.params

  // Strict filename validation: <slug>.<ext> only, where slug is the
  // sanitized cache key used by /api/visualize. Anything else is
  // rejected so a malicious request can't traverse out of CACHE_DIR.
  if (!/^[A-Za-z0-9._-]+$/.test(name) || name.includes("..")) {
    return new Response("Bad request", { status: 400 })
  }

  const absolute = path.resolve(CACHE_DIR, name)
  if (!absolute.startsWith(CACHE_DIR + path.sep)) {
    return new Response("Bad request", { status: 400 })
  }

  let bytes: Buffer
  try {
    const s = await stat(absolute)
    if (!s.isFile()) {
      return new Response("Not found", { status: 404 })
    }
    bytes = await readFile(absolute)
  } catch {
    return new Response("Not found", { status: 404 })
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mimeForFile(name),
      // Cache aggressively on the client/CDN once a file exists; the
      // cache key encodes (room × flooring) so the file is immutable.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
