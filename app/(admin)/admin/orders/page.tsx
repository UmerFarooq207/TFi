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

type FilterStatus = "all" | OrderStatus

const STATUS_OPTIONS: OrderStatus[] = [
  "pending", "confirmed", "processing", "delivered", "cancelled",
]

function OrderDialog({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => void }) {
  return (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
                PKR {(item.price * item.quantity).toLocaleString("en-PK")}
              </p>
            </div>
          ))}
        </div>

        <Separator className="bg-border/30" />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs">Total</span>
          <span className="font-medium">PKR {order.total.toLocaleString("en-PK")}</span>
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
      toast.error("Failed to update status")
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
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50 mb-1">
          Management
        </p>
        <h1 className="font-heading text-2xl font-medium text-foreground">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList variant="line" className="flex-wrap">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {STATUS_OPTIONS.map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs capitalize">{s}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-56">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="pl-8 h-8 text-xs border-border"
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
        <div className="border border-border/40 overflow-hidden overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/40">
                {["Order #", "Customer", "Phone", "Items", "Total", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground/40">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={String(order._id)}
                    className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground/90">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.customer.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.customer.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.items.length}</td>
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
                    <td className="px-4 py-3 text-muted-foreground/50">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
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
