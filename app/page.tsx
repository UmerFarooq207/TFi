import Link from "next/link"

export const metadata = {
  title: "TFi — Floors & Interiors",
  description:
    "Considered floors and panels for those who build with intent. Premium flooring, wall paneling, and surfaces.",
}

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="home-hero" data-screen-label="01 Hero">
        <div className="home-hero__leaf-l" aria-hidden />
        <div className="home-hero__leaf-r" aria-hidden />
        <div className="home-hero__brand">TFi</div>

        <div className="tfi-topbar tfi-topbar--on-image">
          <span />
          <Link href="/contact" className="tfi-link" style={{ color: "#fff" }}>
            ↳ Get a quote
          </Link>
        </div>

        <h1 className="home-hero__title">
          Considered floors and panels<br />
          for those who build with intent.
        </h1>
      </section>

      {/* ============ PRODUCT COLLECTION ============ */}
      <section className="collection" data-screen-label="02 Collection">
        <div className="tfi-section-eyebrow">
          <span className="t-eyebrow">
            <span className="diamond">◆</span>Product Collection
          </span>
        </div>

        <div className="collection__row">
          <div />
          <div className="collection__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1400&q=70"
              alt="Engineered wood floor"
            />
            <Link href="/products?category=flooring" className="view">
              View
            </Link>
            <div className="label">Floors</div>
          </div>
          <div className="collection__copy">
            <p>
              Our <strong>floors collection</strong> is built around grain, warmth, and the kind of
              detail you only notice underfoot. Made for rooms that need to last.
            </p>
            <Link href="/products?category=flooring" className="tfi-pill">
              <span className="arrow">↳</span>Product overview
            </Link>
          </div>
        </div>

        <div className="collection__row">
          <div className="collection__copy collection__copy--right">
            <p>
              <strong>Wall panels</strong> in solid oak, walnut, and acoustic felt — engineered
              for rooms that should feel composed, not decorated.
            </p>
            <Link href="/products?category=wall-paneling" className="tfi-pill">
              <span className="arrow">↳</span>Product overview
            </Link>
          </div>
          <div className="collection__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=1400&q=70"
              alt="Wood wall panels"
            />
            <Link href="/products?category=wall-paneling" className="view">
              View
            </Link>
            <div className="label">Panels</div>
          </div>
          <div />
        </div>

        <div className="collection__row">
          <div />
          <div className="collection__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1400&q=70"
              alt="Interior surfaces"
            />
            <Link href="/products?category=kitchen" className="view">
              View
            </Link>
            <div className="label">Surfaces</div>
          </div>
          <div className="collection__copy">
            <p>
              <strong>Surfaces</strong> covers our stone, concrete-effect, and microcement
              finishes — for kitchens, baths, and the kind of rooms that don&apos;t forgive
              shortcuts.
            </p>
            <Link href="/products?category=kitchen" className="tfi-pill">
              <span className="arrow">↳</span>Product overview
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SHOWROOM ============ */}
      <section className="showroom" data-screen-label="03 Showroom">
        <div className="tfi-section-eyebrow">
          <span className="t-eyebrow" style={{ color: "var(--tfi-cream)" }}>
            <span className="diamond">◆</span>Showroom
          </span>
        </div>

        <div className="showroom__row">
          <div className="showroom__title">
            A place where material<br />and craft meet.
          </div>
          <div className="showroom__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=70"
              alt="TFi showroom"
            />
          </div>
          <div className="showroom__addr">
            <div className="lbl">Address</div>
            <div className="val">
              123 Design District, Clifton<br />
              Karachi 75600, Pakistan
            </div>
            <Link href="/contact" className="tfi-pill">
              <span className="arrow">↳</span>Showroom
            </Link>
          </div>
        </div>
      </section>

      {/* ============ APPROACH ============ */}
      <section className="approach" data-screen-label="04 Approach">
        <div className="approach__inner">
          <span className="t-eyebrow" style={{ color: "#fff" }}>
            <span className="diamond">◆</span>Approach
          </span>
          <h2>
            Material first. Detail always.<br />Trends, never.
          </h2>
          <Link href="/calculator" className="tfi-pill">
            <span className="arrow">↳</span>Estimate calculator
          </Link>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats" data-screen-label="05 Stats">
        <div>
          <div className="num">120+</div>
          <div className="lbl">Finishes across floors, panels, surfaces</div>
        </div>
        <div>
          <div className="num">15 yr</div>
          <div className="lbl">Warranty on commercial installations</div>
        </div>
        <div>
          <div className="num">FSC</div>
          <div className="lbl">All timber sourced from certified forests</div>
        </div>
        <div>
          <div className="num">PK</div>
          <div className="lbl">Karachi showroom + nationwide trade</div>
        </div>
      </section>
    </>
  )
}
