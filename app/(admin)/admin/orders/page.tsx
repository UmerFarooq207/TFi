"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Search, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toStoredImageUrl } from "@/lib/image-url"
import type { Order, OrderStatus } from "@/lib/models/order"
import { ADMIN_ORDER_STATUS_BADGE } from "@/lib/admin-status-badges"
import { markSeen, SEEN_KEY_ORDERS } from "@/lib/admin-seen"
import { API_ERROR_MESSAGE } from "@/lib/api-errors"

type FilterStatus = "all" | OrderStatus

const STATUS_OPTIONS: OrderStatus[] = [
  "pending", "confirmed", "processing", "delivered", "cancelled",
]

function OrderDialog({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => void }) {
  return (
    <DialogContent
      aria-describedby={undefined}
      className="max-w-lg max-h-[85vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle className="font-heading text-lg font-medium">
          Order {order.orderNumber}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-5 text-sm">
        {/* Customer info */}
        <div className="space-y-2">
          <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">Customer</p>
          <div className="grid grid-cols-2 gap-y-1 text-xs">
            <span className="text-muted-foreground">Name</span>
            <span>{order.customer.name}</span>
            <span className="text-muted-foreground">Email</span>
            <span>{order.customer.email}</span>
            <span className="text-muted-foreground">Phone</span>
            <span>{order.customer.phone}</span>
            <span className="text-muted-foreground">Address</span>
            <span>{order.customer.address}, {order.customer.city}</span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Items */}
        <div className="space-y-3">
          <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">Items</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 bg-secondary overflow-hidden shrink-0">
                <Image
                  src={toStoredImageUrl(item.image)}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/90 truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-xs text-foreground/80 shrink-0">
                £{(item.price * item.quantity).toLocaleString("en-GB")}
              </p>
            </div>
          ))}
        </div>

        <Separator className="bg-border/30" />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs">Total</span>
          <span className="font-medium">£{order.total.toLocaleString("en-GB")}</span>
        </div>

        <Separator className="bg-border/30" />

        {/* Status update */}
        <div className="space-y-2">
          <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">Update Status</p>
          <Select
            defaultValue={order.status}
            onValueChange={(v) => onStatusChange(String(order._id), v as OrderStatus)}
          >
            <SelectTrigger className="h-9 border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {order.notes && (
          <div className="space-y-1">
            <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">Notes</p>
            <p className="text-xs text-muted-foreground">{order.notes}</p>
          </div>
        )}
      </div>
    </DialogContent>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [search, setSearch] = useState("")

  async function fetchOrders() {
    setLoading(true)
    const res = await fetch("/api/orders")
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    markSeen(SEEN_KEY_ORDERS)
  }, [])

  async function handleStatusChange(id: string, status: OrderStatus) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === id ? { ...o, status } : o))
      )
      toast.success("Order status updated")
    } else {
      toast.error(API_ERROR_MESSAGE)
    }
  }

  const filtered = orders.filter((o) => {
    const matchesStatus = filter === "all" || o.status === filter
    const matchesSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <header className="admin-page-head">
        <div className="admin-page-head__lead">
          <p className="admin-eyebrow">Management</p>
          <h1 className="admin-h1">
            Orders<span className="accent">.</span>
          </h1>
          <p className="admin-page-head__sub">
            {orders.length} orders · {orders.filter(o => o.status === "pending").length} pending action.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white border border-border/40 px-4 py-3 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList variant="line" className="flex-wrap">
            <TabsTrigger value="all" className="text-[10px] tracking-[0.18em] uppercase">All</TabsTrigger>
            {STATUS_OPTIONS.map((s) => (
              <TabsTrigger key={s} value={s} className="text-[10px] tracking-[0.18em] uppercase capitalize">{s}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="pl-8 h-9 text-xs border-border/60 bg-card"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="admin-table-shell overflow-x-auto">
          <table className="admin-table w-full text-xs min-w-[760px]">
            <thead>
              <tr>
                {["Order #", "Customer", "Phone", "Items", "Total", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground/40">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={String(order._id)}
                    className="border-t border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground/95">{order.orderNumber}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{order.customer.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{order.customer.phone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{order.items.length}</td>
                    <td className="px-5 py-3.5 text-foreground/85">
                      £{order.total.toLocaleString("en-GB")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] tracking-wider uppercase ${ADMIN_ORDER_STATUS_BADGE[order.status] ?? ""}`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground/55">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Eye size={13} />
                          </Button>
                        </DialogTrigger>
                        <OrderDialog order={order} onStatusChange={handleStatusChange} />
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
