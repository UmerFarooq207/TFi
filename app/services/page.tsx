import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Flooring, wall paneling, and kitchen solutions from TFi — premium materials, precision installation.",
}

const services = [
  {
    id: "flooring",
    number: "01",
    title: "Flooring Solutions",
    headline: "The foundation of every refined space.",
    description:
      "From wide-plank European oak to Italian porcelain and luxury vinyl plank — we source, specify, and install flooring that performs beautifully for decades. Our team handles site preparation, moisture management, and finishing with equal care.",
    gradient:
      "radial-gradient(ellipse 80% 60% at 30% 50%, oklch(0.22 0.025 55), oklch(0.09 0.006 55))",
    features: [
      "Solid & engineered hardwood",
      "Porcelain & ceramic tile",
      "Luxury vinyl plank (LVP)",
      "Natural stone (marble, travertine)",
      "Herringbone & chevron patterns",
      "Underfloor heating compatible",
    ],
  },
  {
    id: "paneling",
    number: "02",
    title: "Wall Paneling",
    headline: "Surfaces that command attention.",
    description:
      "Wall paneling transforms architecture. We design and install slatted wood walls, fluted panels, stone cladding, and bespoke 3D feature walls. Each project is custom-fitted to your space, with concealed fixings and seamless edge details.",
    gradient:
      "radial-gradient(ellipse 80% 60% at 70% 50%, oklch(0.18 0.012 50), oklch(0.09 0.006 55))",
    features: [
      "Timber slat & fluted panels",
      "Stone & marble cladding",
      "3D textured feature walls",
      "Wainscoting & dado rails",
      "Acoustic panel systems",
      "Full-height panel systems",
    ],
  },
  {
    id: "kitchen",
    number: "03",
    title: "Kitchen Solutions",
    headline: "Where function meets elegance.",
    description:
      "We design modular and fully bespoke kitchens — from handleless contemporary to classic shaker. All cabinetry is built to measure, finished in paint, veneer, or lacquer, and paired with countertops in quartz, granite, or engineered stone.",
    gradient:
      "radial-gradient(ellipse 80% 60% at 20% 60%, oklch(0.20 0.015 65), oklch(0.09 0.006 55))",
    features: [
      "Modular & bespoke cabinetry",
      "Handleless & shaker styles",
      "Quartz & granite countertops",
      "Integrated appliance planning",
      "Custom island design",
      "Splashback tile installation",
    ],
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* ── Page Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-28 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 10% 60%, oklch(0.17 0.016 60 / 0.6), transparent 55%), oklch(0.09 0.006 55)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">Services</p>
            <h1 className="font-heading font-medium text-foreground leading-tight">
              <span className="block text-5xl md:text-6xl lg:text-7xl">Three specialisms.</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl italic text-foreground/40">
                One standard.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Flooring, wall paneling, and kitchens — delivered at the same level of precision
              regardless of scope.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Service Sections ─────────────────────────────────────────── */}
      {services.map((service, i) => (
        <section
          key={service.id}
          id={service.id}
          className="py-24 lg:py-32 border-t border-border/40 scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start ${
                i % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* Visual panel */}
              <FadeIn direction={i % 2 === 0 ? "left" : "right"}>
                <div
                  className="h-80 lg:h-[480px] w-full flex items-end p-8 lg:p-10"
                  style={{ background: service.gradient }}
                >
                  <span className="font-heading text-7xl font-medium text-foreground/10 select-none">
                    {service.number}
                  </span>
                </div>
              </FadeIn>

              {/* Content */}
              <FadeIn
                direction={i % 2 === 0 ? "right" : "left"}
                delay={0.1}
                className={i % 2 === 1 ? "lg:col-start-1" : ""}
              >
                <div className="lg:py-8">
                  <span className="text-xs tracking-[0.25em] uppercase text-accent">
                    {service.number} — {service.title}
                  </span>
                  <h2 className="mt-4 font-heading text-3xl md:text-4xl font-medium text-foreground leading-snug">
                    {service.headline}
                  </h2>
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check size={13} className="text-accent shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    className="mt-10 px-8 h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 group"
                  >
                    <Link href="/contact">
                      Get a Quote{" "}
                      <ArrowRight
                        size={13}
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-5">
              Let&apos;s Talk
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-medium text-foreground">
              Not sure where to start?
            </h2>
            <p className="mt-5 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Our consultants can help you select the right materials for your space, budget,
              and lifestyle.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-8 px-10 h-12 text-xs tracking-[0.2em] uppercase border-border text-foreground/70 hover:text-foreground hover:bg-secondary/50"
            >
              <Link href="/contact">Book a Consultation</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
