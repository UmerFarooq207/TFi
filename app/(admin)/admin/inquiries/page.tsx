"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Search, Eye, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Inquiry, InquiryStatus } from "@/lib/models/inquiry"
import { ADMIN_INQUIRY_STATUS_BADGE } from "@/lib/admin-status-badges"

type FilterStatus = "all" | InquiryStatus

const STATUS_OPTIONS: InquiryStatus[] = ["new", "in-progress", "resolved", "archived"]

function InquiryDialog({
  inquiry,
  onUpdate,
}: {
  inquiry: Inquiry
  onUpdate: (id: string, patch: Partial<Inquiry>) => void
}) {
  const [notes, setNotes] = useState(inquiry.notes ?? "")
  const [savingNotes, setSavingNotes] = useState(false)

  const saveNotes = async () => {
    setSavingNotes(true)
    await onUpdate(String(inquiry._id), { notes })
    setSavingNotes(false)
  }

  return (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-heading text-lg font-medium">
          Inquiry from {inquiry.name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-5 text-sm">
        <div className="space-y-2">
          <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">
            Contact
          </p>
          <div className="grid grid-cols-2 gap-y-1 text-xs">
            <span className="text-muted-foreground">Name</span>
            <span>{inquiry.name}</span>
            <span className="text-muted-foreground">Email</span>
            <span className="break-all">{inquiry.email}</span>
            {inquiry.phone && (
              <>
                <span className="text-muted-foreground">Phone</span>
                <span>{inquiry.phone}</span>
              </>
            )}
            {inquiry.service && (
              <>
                <span className="text-muted-foreground">Interest</span>
                <span>{inquiry.service}</span>
              </>
            )}
            <span className="text-muted-foreground">Received</span>
            <span>{new Date(inquiry.createdAt).toLocaleString("en-PK")}</span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        <div className="space-y-2">
          <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">
            Message
          </p>
          <p className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap">
            {inquiry.message}
          </p>
        </div>

        <Separator className="bg-border/30" />

        <div className="space-y-2">
          <p className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">
            Update Status
          </p>
          <Select
            defaultValue={inquiry.status}
            onValueChange={(v) =>
              onUpdate(String(inquiry._id), { status: v as InquiryStatus })
            }
          >
            <SelectTrigger className="h-9 border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground/50">
            Internal Notes
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about follow-up actions…"
            className="min-h-[100px] text-xs"
          />
          <Button
            size="sm"
            onClick={saveNotes}
            disabled={savingNotes || notes === (inquiry.notes ?? "")}
            className="text-xs tracking-[0.15em] uppercase"
          >
            {savingNotes ? "Saving…" : "Save Notes"}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [search, setSearch] = useState("")

  async function fetchInquiries() {
    setLoading(true)
    const res = await fetch("/api/inquiries")
    const data = await res.json()
    setInquiries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  async function handleUpdate(id: string, patch: Partial<Inquiry>) {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const updated = await res.json()
      setInquiries((prev) =>
        prev.map((q) => (String(q._id) === id ? { ...q, ...updated } : q))
      )
      toast.success("Inquiry updated")
    } else {
      toast.error("Failed to update inquiry")
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" })
    if (res.ok) {
      setInquiries((prev) => prev.filter((q) => String(q._id) !== id))
      toast.success("Inquiry deleted")
    } else {
      toast.error("Failed to delete inquiry")
    }
  }

  const filtered = inquiries.filter((q) => {
    const matchesStatus = filter === "all" || q.status === filter
    const matchesSearch =
      !search ||
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.email.toLowerCase().includes(search.toLowerCase()) ||
      q.message.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50 mb-1">
          Customer Communications
        </p>
        <h1 className="font-heading text-2xl font-medium text-foreground">Inquiries</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList variant="line" className="flex-wrap">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {STATUS_OPTIONS.map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs capitalize">
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, message…"
            className="pl-8 h-8 text-xs border-border"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-border/40 overflow-hidden overflow-x-auto">
          <table className="w-full text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/40">
                {["Name", "Email", "Service", "Message", "Status", "Date", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-foreground font-medium tracking-wider uppercase text-[9px]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground/40">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((inquiry) => (
                  <tr
                    key={String(inquiry._id)}
                    className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground/90">
                      {inquiry.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground break-all">
                      {inquiry.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inquiry.service ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[260px] truncate">
                      {inquiry.message}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] tracking-wider uppercase ${ADMIN_INQUIRY_STATUS_BADGE[inquiry.status] ?? ""}`}
                      >
                        {inquiry.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/50">
                      {new Date(inquiry.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="View inquiry">
                              <Eye size={13} />
                            </Button>
                          </DialogTrigger>
                          <InquiryDialog inquiry={inquiry} onUpdate={handleUpdate} />
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Delete inquiry">
                              <Trash2 size={13} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the message from {inquiry.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(String(inquiry._id))}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
