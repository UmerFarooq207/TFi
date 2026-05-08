"use client"

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
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/promos", label: "Promos", icon: Tag },
]

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

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
