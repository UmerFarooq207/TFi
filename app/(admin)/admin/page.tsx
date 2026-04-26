"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ShoppingCart, Clock, BadgePoundSterling, Plus, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Order } from "@/lib/models/order"
import { ADMIN_ORDER_STATUS_BADGE } from "@/lib/admin-status-badges"

interface Stats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
}

export default function AdminDashboard() {
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
      setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts, icon: Package },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingCart },
    { label: "Pending Orders", value: stats?.pendingOrders, icon: Clock },
    {
      label: "Total Revenue",
      value:
        stats != null
          ? `PKR ${(stats.totalRevenue ?? 0).toLocaleString("en-PK")}`
          : undefined,
      icon: BadgePoundSterling,
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground/50 mb-1">
          Overview
        </p>
        <h1 className="font-heading text-2xl font-medium text-foreground">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="border border-border/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/50">
                {card.label}
              </p>
              <card.icon size={14} className="text-muted-foreground/30" />
            </div>
            {loading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="font-heading text-2xl font-medium text-foreground">
                {card.value ?? "—"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Button asChild size="sm" className="text-xs tracking-[0.15em] uppercase">
          <Link href="/admin/products/new">
            <Plus size={12} className="mr-1" /> Add Product
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs tracking-[0.15em] uppercase border-border"
        >
          <Link href="/admin/orders">
            <List size={12} className="mr-1" /> All Orders
          </Link>
        </Button>
      </div>

      {/* Recent orders */}
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50 mb-5">
          Recent Orders
        </p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 py-8 text-center border border-border/30">
            No orders yet.
          </p>
        ) : (
          <div className="border border-border/40 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/40">
                  <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                    Order #
                  </th>
                  <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px] hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px] hidden md:table-cell">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px] hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={String(order._id)}
                    className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground/90">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {order.customer.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      PKR {order.total.toLocaleString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] tracking-wider uppercase ${ADMIN_ORDER_STATUS_BADGE[order.status] ?? ""}`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/50 hidden lg:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
