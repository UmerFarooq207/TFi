"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { TfiCartButton } from "@/components/tfi-cart-button"

/**
 * Pinned hero: the background image stays fixed while the user scrolls.
 * Stage 1 shows the main title. As scroll progresses the title translates
 * up and out, and a second-stage panel (eyebrow · divider · supporting
 * copy) fades in over the same image. Falls back to a static hero for
 * reduced-motion users.
 */
export function HeroPin() {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  const titleY = useTransform(p, [0, 0.4], ["0vh", "-30vh"])
  const titleOpacity = useTransform(p, [0, 0.32, 0.42], [1, 1, 0])
  const panelOpacity = useTransform(p, [0.38, 0.62], [0, 1])
  const panelY = useTransform(p, [0.38, 0.7], [30, 0])
  const overlay = useTransform(p, [0, 0.5, 1], [0.30, 0.45, 0.55])
  const imgScale = useTransform(p, [0, 1], [1.06, 1])

  if (reduce) {
    return (
      <section
        ref={wrapRef}
        className="home-hero"
        data-screen-label="01 Hero"
        style={{ position: "relative" }}
      >
        <div className="home-hero__leaf-l" aria-hidden />
        <div className="home-hero__leaf-r" aria-hidden />
        <div className="home-hero__brand">
          <Image
            src="/assets/TFi-logo.png"
            alt="TFi"
            width={520}
            height={200}
            priority
            style={{ width: "auto", height: "clamp(72px, 9vw, 120px)", objectFit: "contain" }}
          />
        </div>
        <div className="tfi-topbar tfi-topbar--on-image">
          <span />
          <div className="tfi-topbar__right">
            <Link href="/contact" className="tfi-link" style={{ color: "#fff" }}>
              ↳ Get a quote
            </Link>
            <TfiCartButton />
          </div>
        </div>
        <div className="home-hero__headline">
          <Reveal>
            <Link href="/products" className="tfi-pill tfi-pill--light">
              <span className="arrow">↳</span>Shop Now
            </Link>
          </Reveal>
          <h1 className="home-hero__title">
            <Reveal><span>Elevating Interiors</span></Reveal>
            <br />
            <Reveal delay={0.12}><span>from the Ground Up.</span></Reveal>
          </h1>
        </div>
      </section>
    )
  }

  return (
    <section ref={wrapRef} className="hero-pin" data-screen-label="01 Hero" style={{ position: "relative" }}>
      <div className="hero-pin__sticky">
        <motion.div className="hero-pin__image" style={{ scale: imgScale }} aria-hidden />
        <div className="hero-pin__leaf-l" aria-hidden />
        <div className="hero-pin__leaf-r" aria-hidden />
        <motion.span className="hero-pin__overlay" style={{ opacity: overlay }} aria-hidden />

        <div className="hero-pin__brand">
          <Image
            src="/assets/TFi-logo.png"
            alt="TFi"
            width={520}
            height={200}
            priority
            style={{ width: "auto", height: "clamp(72px, 9vw, 120px)", objectFit: "contain" }}
          />
        </div>

        <div className="tfi-topbar tfi-topbar--on-image">
          <span />
          <div className="tfi-topbar__right">
            <Link href="/contact" className="tfi-link" style={{ color: "#fff" }}>
              ↳ Get a quote
            </Link>
            <TfiCartButton />
          </div>
        </div>

        <motion.div className="hero-pin__headline" style={{ y: titleY, opacity: titleOpacity }}>
          <Reveal>
            <Link href="/products" className="tfi-pill tfi-pill--light">
              <span className="arrow">↳</span>Shop Now
            </Link>
          </Reveal>
          <h1 className="hero-pin__title">
            <Reveal><span>Elevating Interiors</span></Reveal>
            <br />
            <Reveal delay={0.12}><span>from the Ground Up.</span></Reveal>
          </h1>
        </motion.div>

        <motion.div className="hero-pin__panel" style={{ opacity: panelOpacity, y: panelY }}>
          <div className="hero-pin__panel-row">
            <span className="t-eyebrow hero-pin__eyebrow">
              Floors &amp; Interiors
            </span>
            <span className="hero-pin__divider" aria-hidden />
            <p className="hero-pin__copy">
              We supply and install premium flooring, carpets, wall panels, and interior surfaces
              crafted to elevate modern residential and commercial spaces. Every detail is chosen
              with precision, quality, and timeless design in mind.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
