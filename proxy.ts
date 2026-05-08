import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const AUTH_COOKIE = "tfi-session"

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not defined")
  return new TextEncoder().encode(secret)
}

type Role = "admin"

async function readSession(token: string | undefined): Promise<{ sub: string; role: Role } | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.sub === "string" && payload.role === "admin") {
      return { sub: payload.sub, role: payload.role }
    }
    return null
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const session = await readSession(token)

  // Admin pages — admin only
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("from", pathname + search)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Checkout — admin only
  if (pathname === "/checkout") {
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("from", pathname + search)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Auth pages — redirect logged-in admins away
  if (pathname === "/login" || pathname === "/signup") {
    if (session) {
      const url = new URL("/admin", request.url)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/checkout", "/login", "/signup"],
}
