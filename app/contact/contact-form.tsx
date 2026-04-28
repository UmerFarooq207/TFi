"use client"

import { useState } from "react"

type FormState = {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

const SERVICES = [
  "Floors",
  "Panels",
  "Surfaces",
  "Not sure yet",
]

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    service: SERVICES[0],
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
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
      <div style={{ paddingTop: 24 }}>
        <div className="t-h3" style={{ marginBottom: 8 }}>Message received.</div>
        <p style={{ color: "var(--tfi-mute)", maxWidth: 360 }}>
          Thanks — we&apos;ll be in touch within one business day.
        </p>
      </div>
    )
  }

  return (
    <form className="ct__form" onSubmit={handleSubmit}>
      <div className="ct__row">
        <input
          name="name"
          type="text"
          placeholder="Full name"
          required
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={handleChange}
      />
      <select name="service" value={form.service} onChange={handleChange}>
        {SERVICES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea
        name="message"
        placeholder="Tell us about the room — area, finish, timeline."
        required
        value={form.message}
        onChange={handleChange}
      />
      {error && (
        <div style={{ color: "var(--destructive)", fontSize: 13 }}>{error}</div>
      )}
      <button type="submit" className="tfi-pill" disabled={loading} style={{ alignSelf: "flex-start" }}>
        <span className="arrow">↳</span>
        {loading ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  )
}
