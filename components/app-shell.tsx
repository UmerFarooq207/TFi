"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { TfiFooter } from "@/components/tfi-footer"
import { PageTransition } from "@/components/page-transition"
import { CartDrawer } from "@/components/cart-drawer"

/**
 * Top-level layout shell. Receives `header` as a prop so the server-rendered
 * SiteHeader (async, fetches taxonomy) can be composed into this client wrapper.
 * The header replaces the legacy TfiDock on public pages.
 */
export function AppShell({
  children,
  header,
}: {
  children: React.ReactNode
  header?: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  const isVisualizer = pathname === "/visualizer"
  const isPublicTfi = !isAdmin && !isAuthPage

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("admin-theme", isAdmin)
    document.documentElement.classList.toggle("tfi-theme", isPublicTfi)
    return () => {
      document.documentElement.classList.remove("admin-theme")
      document.documentElement.classList.remove("tfi-theme")
    }
  }, [isAdmin, isPublicTfi])

  if (isAdmin) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  }

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      {/* Visualizer is an immersive full-bleed experience — no header chrome. */}
      {!isVisualizer && header}
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      {!isVisualizer && <TfiFooter />}
      <CartDrawer />
    </>
  )
}
