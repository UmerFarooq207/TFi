import Link from "next/link"
import { HomeExtras } from "@/components/home-extras"
import { TestimonialsMarquee } from "@/components/testimonials-marquee"
import { ShowroomScroll } from "@/components/showroom-scroll"
import { HeroPin } from "@/components/hero-pin"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"
import { FeaturedProducts } from "@/components/featured-products"
import { CategoryShowcase } from "@/components/category-showcase"

// Render on each request so category tags reflect the live product catalogue.
export const dynamic = "force-dynamic"

export const metadata = {
  title: { absolute: "Premium Flooring & Interiors Designed for British Homes | TFi UK" },
  description:
    "TFi Floors and Interiors supplies premium engineered oak flooring, acoustic wall panels, microcement surfaces and bespoke kitchens — designed for British homes and delivered UK-wide from our Birmingham showroom. 15-year commercial warranty.",
  keywords: [
    "premium flooring UK",
    "engineered oak flooring British homes",
    "acoustic wall panels UK",
    "microcement surfaces UK",
    "bespoke kitchens British homes",
    "flooring supplier Birmingham",
    "TFi Floors and Interiors",
    "wide plank oak floors UK",
    "stair treads UK",
    "nationwide UK flooring delivery",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Premium Flooring & Interiors Designed for British Homes | TFi UK",
    description:
      "Engineered oak, acoustic wall panels, microcement and bespoke kitchens for British homes — supplied UK-wide from Birmingham.",
    url: "/",
    type: "website",
  },
}

const TESTIMONIALS = [
  { name: "Eleanor Whitfield", role: "Architect, EW Studio",          initials: "EW", rating: 5, text: "Specified TFi engineered oak across three retail fits this year. Lead times held, finish held, install crew loved working with the boards." },
  { name: "Marcus Hale",       role: "Homeowner, Clifton",            initials: "MH", rating: 5, text: "We renovated the whole ground floor with their fumed walnut. Two years on it still looks the day it went down. Worth every penny." },
  { name: "Sasha Devereux",    role: "Interior designer",             initials: "SD", rating: 5, text: "Their acoustic panels saved a ceiling project that the contractor swore couldn't be done. Showroom team knew their stuff inside out." },
  { name: "James Okonkwo",     role: "Build manager, Kindred",        initials: "JO", rating: 4, text: "Microcement is finally a material I trust. We've used six finishes from TFi this year. Trade portal is genuinely useful." },
  { name: "Iris Karpinska",    role: "Studio principal, IK Practice", initials: "IK", rating: 5, text: "What I appreciate most is restraint — clean samples, real grain, no stylistic noise. It's how the catalogue should work." },
  { name: "Dominic Reyes",     role: "Developer, Reyes & Co.",        initials: "DR", rating: 5, text: "We did a 14-flat refurb on stair treads alone. Cut to spec, on time, and warranty paperwork was the easiest part of the job." },
]

const BRANDS = [
  { name: "AGT",      logo: "/assets/AGT-logo.png" },
  { name: "Finfloor", logo: "/assets/Finfloor-logo.webp" },
  { name: "Finsa",    logo: "/assets/Finsa-logo.png" },
]

export default function HomePage() {
  return (
    <>
      {/* ============ HERO — pinned two-stage reveal ============ */}
      <HeroPin />

      {/* ============ PRODUCT CATEGORIES (bento) ============ */}
      <CategoryShowcase />

      {/* ============ BRANDS ============ */}
      <section className="brands" data-screen-label="03 Brands">
        <div className="tfi-section-eyebrow">
          <Reveal>
            <span className="t-eyebrow">
              <span className="diamond">◆</span>Our Brands
            </span>
          </Reveal>
        </div>
        <div className="brands__intro">
          <h2>
            <Reveal><span>Shop by Brand.</span></Reveal>
          </h2>
          <FadeUp delay={0.12}>
            <p>
              Browse curated ranges from leading European manufacturers — tap a brand to
              see its full collection.
            </p>
          </FadeUp>
        </div>
        <StaggerGroup className="brand-grid" stagger={0.08}>
          {BRANDS.map((b) => (
            <StaggerItem key={b.name}>
              <Link href={`/products?brand=${encodeURIComponent(b.name)}`} className="brand-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo} alt={`${b.name} flooring — shop ${b.name} products`} className="brand-card__logo" loading="lazy" />
                <span className="brand-card__cta"><span className="arrow">↳</span>Shop {b.name}</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ============ PRODUCT SHOWCASE — featured from DB ============ */}
      <FeaturedProducts />

      {/* ============ VISUALIZER ============ */}
      <section className="visualizer-cta" data-screen-label="05 Visualizer">
        <div className="visualizer-cta__inner">
          <Reveal>
            <span className="t-eyebrow" style={{ color: "#fff" }}>
              <span className="diamond">◆</span>Room Visualizer
            </span>
          </Reveal>
          <h2>
            <Reveal><span>Find the right flooring</span></Reveal>
            <br />
            <Reveal delay={0.08}><span>shade for your home.</span></Reveal>
          </h2>
          <FadeUp delay={0.14}>
            <p className="visualizer-cta__sub">
              Choose your desired product and see its visuals before you order.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <Link href="/visualizer" className="tfi-pill tfi-pill--light">
              <span className="arrow">↳</span>Try the visualizer
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ============ TESTIMONIALS — infinite marquee ============ */}
      <section className="testimonials" data-screen-label="04 Testimonials">
        <div className="testimonials__head">
          <Reveal>
            <span className="t-eyebrow" style={{ color: "var(--tfi-cream)" }}>
              <span className="diamond">◆</span>What Our Customers Say
            </span>
          </Reveal>
          <h2>
            <Reveal><span>Trusted by Architects,</span></Reveal>
            <br />
            <Reveal delay={0.08}><span>Homeowners &amp; Trade.</span></Reveal>
          </h2>
        </div>
        <TestimonialsMarquee items={TESTIMONIALS} />
      </section>

      {/* ============ SHOWROOM — pinned scroll-expansion ============ */}
      <ShowroomScroll />

      {/* ============ APPROACH ============ */}
      <section className="approach" data-screen-label="07 Approach">
        <div className="approach__inner">
          <Reveal>
            <span className="t-eyebrow" style={{ color: "#fff" }}>
              <span className="diamond">◆</span>Approach
            </span>
          </Reveal>
          <h2>
            <Reveal><span>Expert Craftsmanship.</span></Reveal>
            <br />
            <Reveal delay={0.08}><span>Built to Last a Lifetime.</span></Reveal>
          </h2>
          <FadeUp delay={0.18}>
            <Link href="/calculator" className="tfi-pill">
              <span className="arrow">↳</span>Estimate calculator
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <StaggerGroup className="stats" stagger={0.08}>
        <StaggerItem><div><div className="num">120+</div><div className="lbl">Finishes across floors, panels, surfaces</div></div></StaggerItem>
        <StaggerItem><div><div className="num">15 yr</div><div className="lbl">Warranty on commercial installations</div></div></StaggerItem>
        <StaggerItem><div><div className="num">UK</div><div className="lbl">Birmingham showroom</div></div></StaggerItem>
        <StaggerItem><div><div className="num">Nationwide</div><div className="lbl">Delivery to addresses across the United Kingdom</div></div></StaggerItem>
      </StaggerGroup>

      <HomeExtras />
    </>
  )
}
