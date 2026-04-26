import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with TFi to discuss your flooring, paneling, or kitchen project. We respond within one business day.",
}

const contactDetails = [
  {
    icon: MapPin,
    label: "Showroom",
    lines: ["123 Design District, Clifton", "Karachi 75600, Pakistan"],
  },
  {
    icon: Phone,
    label: "Phone",
    lines: ["+92 300 123 4567"],
    href: "tel:+923001234567",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["hello@tfi.pk"],
    href: "mailto:hello@tfi.pk",
  },
  {
    icon: Clock,
    label: "Hours",
    lines: ["Monday – Saturday", "10:00 am – 7:00 pm"],
  },
]

export default function ContactPage() {
  return (
    <>
      {/* ── Page Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-28 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 90% 30%, oklch(0.16 0.014 55 / 0.5), transparent 55%), oklch(0.09 0.006 55)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">Contact</p>
            <h1 className="font-heading font-medium text-foreground leading-tight">
              <span className="block text-5xl md:text-6xl lg:text-7xl">Let&apos;s talk about</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl italic text-foreground/40">
                your project.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Whether you have a clear brief or are just beginning to explore possibilities —
              we&apos;d love to hear from you.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Form + Info ──────────────────────────────────────────────── */}
      <section className="pb-24 lg:pb-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20">
            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-8">
                  Send a Message
                </p>
                <ContactForm />
              </FadeIn>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.15}>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-8">
                  Find Us
                </p>
                <div className="space-y-8">
                  {contactDetails.map((detail) => {
                    const Icon = detail.icon
                    return (
                      <div key={detail.label} className="flex gap-4">
                        <div className="mt-0.5 w-8 h-8 flex items-center justify-center bg-secondary border border-border/40 shrink-0">
                          <Icon size={14} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                            {detail.label}
                          </p>
                          {detail.href ? (
                            detail.lines.map((line) => (
                              <a
                                key={line}
                                href={detail.href}
                                className="block text-sm text-foreground/80 hover:text-accent transition-colors duration-200"
                              >
                                {line}
                              </a>
                            ))
                          ) : (
                            detail.lines.map((line) => (
                              <p key={line} className="text-sm text-foreground/80">
                                {line}
                              </p>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-12 pt-8 border-t border-border/40">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Prefer to visit in person? Our showroom is open six days a week. No
                    appointment necessary, though we recommend calling ahead for a dedicated
                    consultation slot.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
