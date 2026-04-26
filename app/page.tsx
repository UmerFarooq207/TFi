import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"
import { HeroItem } from "@/components/hero-animation"

const services = [
  {
    id: "flooring",
    label: "01",
    title: "Flooring",
    description:
      "Hardwood, engineered wood, porcelain tile, luxury vinyl — sourced globally, installed flawlessly.",
    href: "/services#flooring",
  },
  {
    id: "paneling",
    label: "02",
    title: "Wall Paneling",
    description:
      "Textured wood slats, stone cladding, and bespoke 3D panels that transform blank walls into focal points.",
    href: "/services#paneling",
  },
  {
    id: "kitchen",
    label: "03",
    title: "Kitchen Solutions",
    description:
      "Modular cabinetry, quartz countertops, and full kitchen builds engineered for both form and function.",
    href: "/services#kitchen",
  },
]

const projects = [
  {
    title: "Clifton Residence",
    category: "Flooring",
    year: "2025",
    gradient: "from-amber-950/90 via-stone-900/80 to-zinc-950",
  },
  {
    title: "DHA Penthouse",
    category: "Kitchen",
    year: "2025",
    gradient: "from-slate-950/90 via-zinc-900/80 to-stone-950",
  },
  {
    title: "Gulshan Office",
    category: "Wall Paneling",
    year: "2024",
    gradient: "from-zinc-950/90 via-stone-900/80 to-slate-950",
  },
  {
    title: "Bahria Villa",
    category: "Flooring + Kitchen",
    year: "2024",
    gradient: "from-stone-950/90 via-amber-950/80 to-zinc-950",
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Radial background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 20% 55%, oklch(0.18 0.018 60 / 0.7), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, oklch(0.14 0.010 50 / 0.35), transparent 55%), oklch(0.09 0.006 55)",
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.93 0.010 80) 1px, transparent 1px), linear-gradient(90deg, oklch(0.93 0.010 80) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <HeroItem delay={0.15}>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-8">
              Floors & Interiors — Est. 2010
            </p>
          </HeroItem>

          <HeroItem delay={0.3}>
            <h1 className="font-heading font-medium text-foreground leading-[0.93] tracking-tight">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]">
                Interiors
              </span>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] text-foreground/35 italic">
                Defined
              </span>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]">
                by Craft
              </span>
            </h1>
          </HeroItem>

          <HeroItem delay={0.5}>
            <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Premium flooring, wall paneling &amp; kitchen solutions — designed to last and
              built to impress.
            </p>
          </HeroItem>

          <HeroItem delay={0.65}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                asChild
                size="lg"
                className="px-8 h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0"
              >
                <Link href="/services">Explore Services</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 h-12 text-xs tracking-[0.2em] uppercase border-border/80 text-foreground/70 hover:text-foreground hover:bg-secondary/50"
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </HeroItem>
        </div>

        {/* Scroll cue */}
        <HeroItem delay={1.1} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
          <span className="text-[10px] tracking-[0.28em] uppercase">Scroll</span>
          <ChevronDown size={14} className="animate-bounce" />
        </HeroItem>
      </section>

      {/* ── Services Strip ───────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-16">
              What We Do
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/40">
            {services.map((service, i) => (
              <FadeIn key={service.id} delay={i * 0.1} className="h-full">
                <Link
                  href={service.href}
                  className="group block p-8 lg:p-10 h-full hover:bg-secondary/30 transition-colors duration-300"
                >
                  <span className="text-xs tracking-[0.25em] text-muted-foreground/40">
                    {service.label}
                  </span>
                  <h3 className="mt-4 font-heading text-2xl lg:text-3xl font-medium text-foreground group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <ArrowRight size={12} />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Projects ────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                  Featured Work
                </p>
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium text-foreground">
                  The TFi Standard
                  <br />
                  <span className="text-foreground/35 italic">in Action</span>
                </h2>
              </div>
              <Link
                href="/services"
                className="hidden md:flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                All work <ArrowRight size={12} />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {projects.map((project, i) => (
              <FadeIn key={project.title} delay={i * 0.08}>
                <div
                  className={`group relative h-64 sm:h-72 lg:h-80 overflow-hidden cursor-pointer bg-gradient-to-br ${project.gradient}`}
                >
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
                  <div className="absolute inset-0 p-7 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-xs tracking-[0.2em] uppercase text-foreground/40 border border-foreground/10 px-2.5 py-1">
                        {project.category}
                      </span>
                      <span className="text-xs text-foreground/30">{project.year}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-xl md:text-2xl font-medium text-foreground/90">
                        {project.title}
                      </h3>
                      <div className="mt-2 h-px w-8 bg-accent/60 group-hover:w-14 transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-40 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeIn>
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.25em] uppercase text-accent mb-6">
                Start Today
              </p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight">
                Ready to redefine
                <br />
                <span className="italic text-foreground/35">your space?</span>
              </h2>
              <p className="mt-7 text-base text-muted-foreground leading-relaxed max-w-xl">
                Whether you&apos;re planning a full renovation or selecting a single material,
                our team guides you from concept to completion.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-10 px-10 h-12 text-xs tracking-[0.2em] uppercase bg-accent text-accent-foreground hover:bg-accent/85 border-0 group"
              >
                <Link href="/contact">
                  Begin Your Project{" "}
                  <ArrowRight
                    size={14}
                    className="ml-1 group-hover:translate-x-1 transition-transform duration-200"
                  />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
