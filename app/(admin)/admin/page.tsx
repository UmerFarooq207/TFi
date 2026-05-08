"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  Clock,
  Wallet,
  Plus,
  ArrowUpRight,
  Inbox,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Order } from "@/lib/models/order"
import { ADMIN_ORDER_STATUS_BADGE } from "@/lib/admin-status-badges"
import { useAuth } from "@/components/auth-provider"

interface Stats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/orders"),
      ])
      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()
      if (statsRes.ok && statsData && typeof statsData.error === "undefined") {
        setStats({
          totalProducts: Number(statsData.totalProducts) || 0,
          totalOrders: Number(statsData.totalOrders) || 0,
          pendingOrders: Number(statsData.pendingOrders) || 0,
          totalRevenue: Number(statsData.totalRevenue) || 0,
        })
      } else {
        setStats(null)
      }
      setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 6) : [])
      setLoading(false)
    }
    load()
  }, [])

  const firstName = user?.name?.split(" ")[0] ?? "Admin"

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts, icon: Package, hint: "Live catalogue" },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingCart, hint: "All time" },
    { label: "Pending Orders", value: stats?.pendingOrders, icon: Clock, hint: "Awaiting action" },
    {
      label: "Total Revenue",
      value:
        stats != null
          ? `£${(stats.totalRevenue ?? 0).toLocaleString("en-GB")}`
          : undefined,
      icon: Wallet,
      hint: "Gross sales",
    },
  ]

  return (
    <div>
      {/* ============ HEADER ============ */}
      <header className="admin-page-head">
        <div className="admin-page-head__lead">
          <p className="admin-eyebrow">Overview</p>
          <h1 className="admin-h1">
            Welcome back, {firstName}<span className="accent">.</span>
          </h1>
          <p className="admin-page-head__sub">
            A quiet snapshot of catalogue, orders, and inbound demand. Move with intent —
            the rest of the operation is two clicks away.
          </p>
        </div>
        <div className="admin-page-head__actions">
          <Link href="/admin/products/new" className="admin-pill">
            <Plus size={12} /> New Product
          </Link>
          <Link href="/admin/orders" className="admin-pill admin-pill--ghost">
            All Orders <ArrowUpRight size={12} />
          </Link>
        </div>
      </header>

      {/* ============ STAT GRID ============ */}
      <div className="admin-stats">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat">
            <div className="admin-stat__label">
              <span>{card.label}</span>
              <span className="admin-stat__icon">
                <card.icon size={15} />
              </span>
            </div>
            {loading ? (
              <Skeleton className="h-9 w-28 mt-5" />
            ) : (
              <div className="admin-stat__value">{card.value ?? "—"}</div>
            )}
            <div className="admin-stat__hint">{card.hint}</div>
          </div>
        ))}
      </div>

      {/* ============ QUICK NAV CARDS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        {[
          { href: "/admin/products", label: "Catalogue", desc: "Add, edit, and feature products on the public site.", icon: Package },
          { href: "/admin/orders", label: "Orders", desc: "Confirm, track, and update fulfilment status.", icon: ShoppingCart },
          { href: "/admin/inquiries", label: "Inquiries", desc: "Respond to customer messages and trade leads.", icon: Inbox },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative bg-white border border-border/60 p-6 transition-all hover:border-foreground/40 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-foreground/[0.06] text-foreground">
                <card.icon size={17} />
              </span>
              <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
            </div>
            <p className="text-base font-medium text-foreground tracking-tight">{card.label}</p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* ============ RECENT ORDERS ============ */}
      <section className="mt-14">
        <div className="admin-section">
          <h2>Recent Orders</h2>
          <Link href="/admin/orders" className="admin-section__more">
            View all ↗
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 py-16 text-center border border-dashed border-border/40 bg-white">
            No orders yet — your first one will appear here.
          </p>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-table w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left px-6 py-4">Order #</th>
                  <th className="text-left px-6 py-4 hidden sm:table-cell">Customer</th>
                  <th className="text-left px-6 py-4 hidden md:table-cell">Items</th>
                  <th className="text-left px-6 py-4">Total</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={String(order._id)}
                    className="border-t border-border/30 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3.5 font-medium text-foreground/95">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground hidden sm:table-cell">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground hidden md:table-cell">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-3.5 text-foreground/85">
                      £{order.total.toLocaleString("en-GB")}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] tracking-wider uppercase ${ADMIN_ORDER_STATUS_BADGE[order.status] ?? ""}`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground/55 hidden lg:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
