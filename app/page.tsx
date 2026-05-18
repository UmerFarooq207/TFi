import Link from "next/link"
import { HomeExtras } from "@/components/home-extras"
import { TestimonialsMarquee } from "@/components/testimonials-marquee"
import { ShowroomScroll } from "@/components/showroom-scroll"
import { HeroPin } from "@/components/hero-pin"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"
import { FeaturedProducts } from "@/components/featured-products"

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

export default function HomePage() {
  return (
    <>
      {/* ============ HERO — pinned two-stage reveal ============ */}
      <HeroPin />

      {/* ============ PRODUCT COLLECTION (bento) ============ */}
      <section className="collection" data-screen-label="02 Collection">
        <div className="tfi-section-eyebrow">
          <Reveal>
            <span className="t-eyebrow">
              <span className="diamond">◆</span>Product Collection
            </span>
          </Reveal>
        </div>
        <div className="collection__intro">
          <h2>
            <Reveal><span>Premium Surfaces,</span></Reveal>
            <br />
            <Reveal delay={0.08}><span>From Floor to Ceiling.</span></Reveal>
          </h2>
          <FadeUp delay={0.15}>
            <p>
              Six premium flooring and wall paneling collections built around the rooms they go
              into — engineered oak, acoustic slat walls, microcement and stone surfaces,
              specified for UK homes, studios and commercial fit-outs.
            </p>
          </FadeUp>
        </div>

        <StaggerGroup className="bento" stagger={0.09}>
          <StaggerItem className="bento-card bc-sm">
            <Link href="/products?category=flooring" className="bento-card__inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1200&q=70" alt="Premium engineered oak flooring — wide plank European oak from TFi Floors and Interiors UK" loading="lazy" />
              <div className="bc-body">
                <div><div className="bc-eyebrow">Collection 01</div></div>
                <div>
                  <div className="bc-title">Engineered Oak</div>
                  <span className="bc-pill"><span className="arrow">↳</span>View floors</span>
                </div>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem className="bento-card bc-lg">
            <Link href="/products?category=wall-paneling" className="bento-card__inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=1600&q=70" alt="Acoustic slatted wall panels in walnut — sound-absorbing timber wall paneling UK" loading="lazy" />
              <div className="bc-body">
                <div><div className="bc-eyebrow">Collection 02</div></div>
                <div>
                  <div className="bc-title">Acoustic Wall Panels</div>
                  <p className="bc-meta">Solid timber slats over felt — quiet rooms, soft echoes, no compromises.</p>
                  <span className="bc-pill" style={{ marginTop: 14 }}><span className="arrow">↳</span>View panels</span>
                </div>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem className="bento-card bc-half-l">
            <Link href="/products?category=kitchen" className="bento-card__inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=70" alt="Microcement bathroom surface — seamless waterproof microcement kitchens and baths UK" loading="lazy" />
              <div className="bc-body">
                <div><div className="bc-eyebrow">Collection 03</div></div>
                <div>
                  <div className="bc-title">Microcement &amp; Stone</div>
                  <p className="bc-meta">Seamless surfaces for kitchens, baths, and rooms that don&apos;t forgive shortcuts.</p>
                  <span className="bc-pill" style={{ marginTop: 14 }}><span className="arrow">↳</span>View surfaces</span>
                </div>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem className="bento-card bc-half-r">
            <Link href="/products?category=stairs" className="bento-card__inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=70" alt="Solid timber stair treads and risers cut to specification — bespoke staircase joinery UK" loading="lazy" />
              <div className="bc-body">
                <div><div className="bc-eyebrow">Collection 04</div></div>
                <div>
                  <div className="bc-title">Stair &amp; Tread</div>
                  <p className="bc-meta">Solid stair treads, risers, and nosings cut to your build.</p>
                  <span className="bc-pill" style={{ marginTop: 14 }}><span className="arrow">↳</span>View stairs</span>
                </div>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem className="bento-card bc-full">
            <Link href="/products" className="bento-card__inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2000&q=70" alt="Trade flooring and paneling installation for residential and commercial UK builds" loading="lazy" />
              <div className="bc-body">
                <div><div className="bc-eyebrow">For trade</div></div>
                <div>
                  <div className="bc-title">Specifying for residential &amp; commercial builds</div>
                  <span className="bc-pill" style={{ marginTop: 14 }}><span className="arrow">↳</span>Trade portal</span>
                </div>
              </div>
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* ============ PRODUCT SHOWCASE — featured from DB ============ */}
      <FeaturedProducts />

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
      <section className="approach" data-screen-label="06 Approach">
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
