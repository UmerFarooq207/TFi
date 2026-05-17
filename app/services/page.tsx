import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"

export const metadata: Metadata = {
  title: { absolute: "Flooring, Paneling & Bespoke Kitchens UK | TFi Services" },
  description:
    "TFi UK services: premium engineered oak and luxury vinyl flooring supply and installation, acoustic slat and fluted wall paneling, microcement, stone cladding and bespoke kitchen design across Birmingham, London and the UK.",
  keywords: [
    "flooring installation UK",
    "engineered oak flooring installation",
    "wall paneling services UK",
    "acoustic wall panel installation",
    "fluted wall panels UK",
    "stone cladding installation",
    "bespoke kitchen design UK",
    "shaker kitchen installation",
    "handleless kitchen UK",
    "luxury vinyl plank installation",
    "herringbone flooring installation",
    "underfloor heating compatible flooring",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Flooring, Paneling & Bespoke Kitchens UK | TFi Services",
    description:
      "Premium flooring, acoustic wall paneling and bespoke kitchen services from TFi — UK-wide, Birmingham-based.",
    url: "/services",
    type: "website",
  },
}

const services = [
  {
    id: "flooring",
    number: "01",
    title: "Flooring Solutions",
    headline: "Premium UK Flooring Supply & Installation.",
    description:
      "From wide-plank European engineered oak flooring to Italian porcelain tile and luxury vinyl plank (LVP), TFi sources, specifies and installs premium UK flooring that performs beautifully for decades. Our team handles site preparation, moisture management, herringbone and chevron pattern installation and finishing — every floor laid to the same exacting standard.",
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
    headline: "Acoustic, Slat & Fluted Wall Panels.",
    description:
      "Wall paneling transforms architecture. TFi designs and installs slatted timber wall panels, fluted oak panels, acoustic wall systems, stone and marble cladding, and bespoke 3D feature walls across the UK. Every project is custom-fitted to your space with concealed fixings, seamless edge details and full-height panel options for residential and commercial interiors.",
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
    headline: "Bespoke Kitchen Design & Installation.",
    description:
      "TFi designs modular and fully bespoke kitchens in the UK — from handleless contemporary to classic shaker styles. All cabinetry is built to measure, finished in paint, hardwood veneer or lacquer, and paired with premium quartz, granite or engineered stone countertops. Integrated appliance planning, custom kitchen islands and splashback tile installation included.",
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
              <span className="block text-5xl md:text-6xl lg:text-7xl">Flooring, Paneling</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl italic text-foreground/40">
                &amp; Bespoke Kitchens
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Premium flooring, acoustic wall paneling and bespoke kitchen design — supplied,
              installed and finished to the same precision standard across UK homes, studios
              and commercial fit-outs, regardless of project scope.
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
              Need help choosing the right materials?
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
