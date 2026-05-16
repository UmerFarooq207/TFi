import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"

export const metadata: Metadata = {
  title: "About",
  description:
    "TFi has been shaping refined interiors since 2010. Learn about our story, values, and commitment to craft.",
}

const values = [
  {
    label: "Material Integrity",
    description:
      "Every product we specify is vetted for durability, finish quality, and sourcing ethics. No shortcuts.",
  },
  {
    label: "Precision Install",
    description:
      "Our teams are trained on each product category we carry. The difference is in the details.",
  },
  {
    label: "Design Partnership",
    description:
      "We work alongside your architect or designer — or lead the material selection ourselves.",
  },
  {
    label: "Lifetime Support",
    description:
      "Post-installation care, maintenance guidance, and supplier warranties backed by our team.",
  },
]

const stats = [
  { value: "15+", label: "Years of experience" },
  { value: "500+", label: "Projects completed" },
  { value: "3", label: "Product specialisms" },
  { value: "98%", label: "Client satisfaction" },
]

export default function AboutPage() {
  return (
    <>
      {/* ── Page Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 80% 40%, oklch(0.16 0.014 60 / 0.5), transparent 60%), oklch(0.09 0.006 55)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">About TFi</p>
            <h1 className="font-heading font-medium text-foreground leading-tight">
              <span className="block text-5xl md:text-6xl lg:text-7xl">Built on</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl italic text-foreground/40">
                Craft & Conviction
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Fifteen years of transforming interiors across the UK — from private residences
              to landmark commercial projects.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="border-t border-b border-border/40 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-border/40">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="lg:px-10 first:pl-0 last:pr-0">
                  <span className="font-heading text-4xl lg:text-5xl font-medium text-accent">
                    {stat.value}
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground tracking-wide">
                    {stat.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Story ──────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <FadeIn>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
                Our Story
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground leading-snug">
                We started with a single
                <br />
                <span className="italic text-foreground/40">floor. One decision.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="space-y-5 text-muted-foreground text-sm leading-relaxed pt-2 lg:pt-14">
                <p>
                  TFi was founded in 2010 with a simple belief: that the materials underfoot and
                  around you shape how you feel in a space. Our founder, having spent years
                  sourcing surfaces across Europe and South Asia, saw a gap in the UK
                  market for genuinely premium, well-installed interior materials.
                </p>
                <p>
                  From a single showroom in Birmingham, we have grown to serve
                  residential and commercial clients across the UK. Our team of specialists
                  handles everything from material selection and space planning to precision
                  installation and aftercare.
                </p>
                <p>
                  We work with architects, interior designers, and directly with homeowners —
                  wherever the project starts, we bring the same standard of care to the finish.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              How We Work
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-16">
              Four principles we
              <br />
              <span className="italic text-foreground/40">never compromise</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value, i) => (
              <FadeIn key={value.label} delay={i * 0.1}>
                <div className="p-8 lg:p-10 bg-card border border-border/40 hover:border-accent/30 transition-colors duration-300">
                  <span className="text-xs tracking-[0.2em] uppercase text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
                    {value.label}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
                  Let&apos;s build something
                  <br />
                  <span className="italic text-foreground/40">remarkable together.</span>
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="px-8 h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 group"
                >
                  <Link href="/contact">
                    Start a Project{" "}
                    <ArrowRight
                      size={13}
                      className="ml-1 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 h-12 text-xs tracking-[0.2em] uppercase border-border/80 text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                >
                  <Link href="/services">View Services</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
