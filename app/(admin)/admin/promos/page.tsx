"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Trash2, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { API_ERROR_MESSAGE } from "@/lib/api-errors"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Promo } from "@/lib/models/promo"

const schema = z.object({
  code: z.string().min(2, "Code is required"),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive("Discount must be positive"),
  minSubtotal: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
})

const optionalNumber = (v: string) =>
  v === "" || v === null || v === undefined ? undefined : Number(v)

type FormData = z.infer<typeof schema>

const fmtMoney= (n: number) => `£${n.toLocaleString("en-GB")}`

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", type: "percent", value: 10 },
  })

  const type = watch("type")

  async function fetchPromos() {
    setLoading(true)
    const res = await fetch("/api/promos")
    const data = await res.json()
    setPromos(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPromos()
  }, [])

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    const hasMin = typeof data.minSubtotal === "number" && Number.isFinite(data.minSubtotal) && data.minSubtotal > 0
    const hasMax = typeof data.maxUses === "number" && Number.isFinite(data.maxUses) && data.maxUses > 0
    const payload = {
      code: data.code.trim().toUpperCase(),
      type: data.type,
      value: data.value,
      minSubtotal: hasMin ? data.minSubtotal : undefined,
      maxUses: hasMax ? data.maxUses : undefined,
      expiresAt: data.expiresAt || null,
    }
    const res = await fetch("/api/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success(`Promo ${json.code} created`)
      reset({ code: "", type: "percent", value: 10 })
      fetchPromos()
    } else {
      toast.error(API_ERROR_MESSAGE)
    }
    setSubmitting(false)
  }

  async function toggleActive(promo: Promo) {
    const res = await fetch(`/api/promos/${promo._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promo.active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPromos((prev) => prev.map((p) => (String(p._id) === String(promo._id) ? updated : p)))
    } else {
      toast.error(API_ERROR_MESSAGE)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/promos/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPromos((prev) => prev.filter((p) => String(p._id) !== id))
      toast.success("Promo deleted")
    } else {
      toast.error(API_ERROR_MESSAGE)
    }
    setDeletingId(null)
  }

  return (
    <div>
      <header className="admin-page-head">
        <div className="admin-page-head__lead">
          <p className="admin-eyebrow">Promotions</p>
          <h1 className="admin-h1">
            Promo Codes<span className="accent">.</span>
          </h1>
          <p className="admin-page-head__sub">
            Issue discount codes customers can apply at checkout. Codes are
            case-insensitive and can be either percentage- or amount-based.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
        {/* ============ CREATE FORM ============ */}
        <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          <div className="admin-form__group space-y-5">
            <div className="mb-1">
              <span className="admin-form__group-num">01</span>
              <p className="admin-form__group-title">New promo</p>
              <p className="admin-form__group-sub">Customers enter this at checkout.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">Code *</Label>
              <Input
                {...register("code")}
                placeholder="SUMMER20"
                className="h-11 border-border/60 text-sm bg-card uppercase tracking-[0.18em]"
                style={{ textTransform: "uppercase" }}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">Type *</Label>
                <Select defaultValue="percent" onValueChange={(v) => setValue("type", v as "percent" | "fixed")}>
                  <SelectTrigger className="h-11 border-border/60 text-sm bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">
                  {type === "percent" ? "Discount %" : "Amount £"} *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("value", { valueAsNumber: true })}
                  className="h-11 border-border/60 text-sm bg-card"
                />
                {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">Min Subtotal</Label>
                <Input
                  type="number"
                  step="1"
                  {...register("minSubtotal", { setValueAs: optionalNumber })}
                  placeholder="Optional"
                  className="h-11 border-border/60 text-sm bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">Max Uses</Label>
                <Input
                  type="number"
                  step="1"
                  {...register("maxUses", { setValueAs: optionalNumber })}
                  placeholder="Unlimited"
                  className="h-11 border-border/60 text-sm bg-card"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">Expires At</Label>
              <Input
                type="date"
                {...register("expiresAt")}
                className="h-11 border-border/60 text-sm bg-card"
              />
              <p className="text-[10px] text-muted-foreground/55">Leave blank for no expiry.</p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="text-xs tracking-[0.22em] uppercase h-11 w-full mt-2"
            >
              {submitting ? (
                <><Loader2 size={13} className="animate-spin mr-2" /> Creating…</>
              ) : (
                <><Plus size={13} className="mr-2" /> Create Promo</>
              )}
            </Button>
          </div>
        </form>

        {/* ============ TABLE ============ */}
        <div>
          <div className="admin-section">
            <h2>Active &amp; expired ({promos.length})</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : promos.length === 0 ? (
            <div className="text-sm text-muted-foreground/60 py-16 text-center border border-dashed border-border/40 bg-white">
              <Tag size={20} className="mx-auto mb-3 opacity-40" />
              No promo codes yet — create your first on the left.
            </div>
          ) : (
            <div className="admin-table-shell overflow-x-auto">
              <table className="admin-table w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-4">Code</th>
                    <th className="text-left px-5 py-4">Discount</th>
                    <th className="text-left px-5 py-4">Min</th>
                    <th className="text-left px-5 py-4">Uses</th>
                    <th className="text-left px-5 py-4">Expires</th>
                    <th className="text-left px-5 py-4">Active</th>
                    <th className="text-right px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => {
                    const expired = promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()
                    return (
                      <tr
                        key={String(promo._id)}
                        className="border-t border-border/30 hover:bg-foreground/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-semibold tracking-[0.12em] text-foreground/95">{promo.code}</span>
                        </td>
                        <td className="px-5 py-3.5 text-foreground/85">
                          {promo.type === "percent"
                            ? `${promo.value}%`
                            : fmtMoney(promo.value)}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {promo.minSubtotal ? fmtMoney(promo.minSubtotal) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {promo.uses}{promo.maxUses ? ` / ${promo.maxUses}` : ""}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {promo.expiresAt
                            ? new Date(promo.expiresAt).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {expired ? (
                            <Badge variant="outline" className="text-[9px] tracking-wider uppercase border-dashed">
                              Expired
                            </Badge>
                          ) : (
                            <Switch
                              checked={promo.active}
                              onCheckedChange={() => toggleActive(promo)}
                            />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-destructive/60 hover:text-destructive"
                                  disabled={deletingId === String(promo._id)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete promo {promo.code}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Customers using this code at checkout will see an
                                    invalid-code error.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(String(promo._id))}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
