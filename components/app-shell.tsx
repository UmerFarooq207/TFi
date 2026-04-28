"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { TfiDock } from "@/components/tfi-dock"
import { TfiFooter } from "@/components/tfi-footer"
import { PageTransition } from "@/components/page-transition"
import { CartDrawer } from "@/components/cart-drawer"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const isAuthPage = pathname === "/login" || pathname === "/signup"
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
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <TfiFooter />
      <TfiDock />
      <CartDrawer />
    </>
  )
}
