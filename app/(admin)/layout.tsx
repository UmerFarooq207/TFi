"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Inbox,
  Tag,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"
import {
  getLastSeen,
  SEEN_EVENT,
  SEEN_KEY_INQUIRIES,
  SEEN_KEY_ORDERS,
} from "@/lib/admin-seen"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null },
  { href: "/admin/products", label: "Products", icon: Package, badgeKey: null },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badgeKey: "orders" as const },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badgeKey: "inquiries" as const },
  { href: "/admin/promos", label: "Promos", icon: Tag, badgeKey: null },
]

const POLL_INTERVAL_MS = 30_000

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { setOpenMobile } = useSidebar()
  const [counts, setCounts] = useState({ newOrders: 0, newInquiries: 0 })

  const fetchCounts = useCallback(async () => {
    try {
      const sinceOrders = getLastSeen(SEEN_KEY_ORDERS)
      const sinceInquiries = getLastSeen(SEEN_KEY_INQUIRIES)
      const res = await fetch(
        `/api/admin/notifications?sinceOrders=${sinceOrders}&sinceInquiries=${sinceInquiries}`,
        { cache: "no-store" },
      )
      if (!res.ok) return
      const data = await res.json()
      setCounts({
        newOrders: Number(data.newOrders) || 0,
        newInquiries: Number(data.newInquiries) || 0,
      })
    } catch {
      // swallow — badges just stay at their last value
    }
  }, [])

  // Refetch on mount, on route change, on poll, and when a page marks itself seen.
  useEffect(() => {
    fetchCounts()
    const interval = window.setInterval(fetchCounts, POLL_INTERVAL_MS)
    const onSeen = () => fetchCounts()
    window.addEventListener(SEEN_EVENT, onSeen)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener(SEEN_EVENT, onSeen)
    }
  }, [fetchCounts, pathname])

  // Collapse the mobile sidebar drawer whenever the route changes
  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-7">
        <Link href="/admin" className="flex items-center justify-center">
          <Image
            src="/assets/TFi-logo.png"
            alt="TFi Floors & Interiors"
            width={260}
            height={100}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-8 px-2">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            const badge =
              item.badgeKey === "orders"
                ? counts.newOrders
                : item.badgeKey === "inquiries"
                  ? counts.newInquiries
                  : 0
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} className="h-11">
                  <Link
                    href={item.href}
                    className="flex items-center gap-3.5 text-[11px] tracking-[0.22em] uppercase font-semibold"
                  >
                    <item.icon size={15} className="opacity-80" />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
                {badge > 0 && (
                  <SidebarMenuBadge className="bg-red-600 text-white font-bold opacity-100 shadow-sm peer-hover/menu-button:text-white peer-data-active/menu-button:text-white">
                    {badge > 99 ? "99+" : badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-5 space-y-2">
        {user && (
          <div className="px-3 pb-2 space-y-1">
            <p className="text-[9px] tracking-[0.32em] uppercase text-sidebar-foreground/40">
              Signed in
            </p>
            <p className="text-sm text-sidebar-foreground truncate font-medium">{user.name}</p>
            <p className="text-[10px] text-sidebar-foreground/55 truncate">{user.email}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-sidebar-foreground/60 hover:text-sidebar-foreground w-full"
              >
                <LogOut size={13} />
                Logout
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="admin-topbar">
          <SidebarTrigger className="text-foreground -ml-1" />
        </header>
        <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
          <div className="admin-page">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
