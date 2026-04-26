"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Check } from "lucide-react"

type FormState = {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

const services = [
  "Flooring Solutions",
  "Wall Paneling",
  "Kitchen Solutions",
  "Multiple / Not Sure",
]

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to send message")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-start justify-center min-h-64 py-12">
        <div className="w-10 h-10 flex items-center justify-center bg-accent/15 mb-6">
          <Check size={18} className="text-accent" />
        </div>
        <h3 className="font-heading text-2xl font-medium text-foreground">Message received.</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
          Thank you for reaching out. A member of our team will be in touch within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground"
          >
            Full Name <span className="text-accent">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground"
          >
            Email <span className="text-accent">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground"
          >
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+92 300 000 0000"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
            Service Interest
          </Label>
          <Select
            value={form.service}
            onValueChange={(value) => setForm((prev) => ({ ...prev, service: value }))}
          >
            <SelectTrigger
              className="h-11 w-full border-input bg-input/30 text-sm rounded-none text-foreground data-placeholder:text-muted-foreground"
            >
              <SelectValue placeholder="Select a service…" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {services.map((s) => (
                <SelectItem key={s} value={s} className="text-sm">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="message"
          className="text-xs tracking-[0.15em] uppercase text-muted-foreground"
        >
          Message <span className="text-accent">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your project — space type, approximate area, timeline…"
          value={form.message}
          onChange={handleChange}
          required
          className="min-h-[160px]"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto px-10 h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 group disabled:opacity-60"
      >
        {loading ? (
          "Sending…"
        ) : (
          <>
            Send Message{" "}
            <ArrowRight
              size={13}
              className="ml-1 group-hover:translate-x-1 transition-transform duration-200"
            />
          </>
        )}
      </Button>
    </form>
  )
}
