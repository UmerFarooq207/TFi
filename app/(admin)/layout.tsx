"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ExternalLink,
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

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-medium text-sidebar-foreground tracking-wide">
            TFi
          </span>
          <span className="text-[9px] tracking-[0.25em] uppercase text-sidebar-foreground/40 mt-0.5">
            Admin
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 text-xs tracking-[0.15em] uppercase"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-4 space-y-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 text-xs tracking-[0.15em] uppercase text-sidebar-foreground/50 hover:text-sidebar-foreground"
              >
                <ExternalLink size={14} />
                View Site
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-3 text-xs tracking-[0.15em] uppercase text-sidebar-foreground/50 hover:text-sidebar-foreground w-full">
                <LogOut size={14} />
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
        {/* Top bar */}
        <header className="flex shrink-0 items-center gap-3 h-14 border-b border-border bg-background px-4 text-foreground">
          <SidebarTrigger className="text-foreground" />
          <span className="text-xs text-muted-foreground tracking-wider uppercase">
            TFi Admin Panel
          </span>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
