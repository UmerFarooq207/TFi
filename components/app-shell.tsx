"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { CartDrawer } from "@/components/cart-drawer"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("admin-theme", isAdmin)
    return () => document.documentElement.classList.remove("admin-theme")
  }, [isAdmin])

  if (isAdmin) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
