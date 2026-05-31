"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion"
import { Reveal, FadeUp } from "@/components/reveal"

/**
 * Pinned showroom: a tall scroll container with a sticky inner stage.
 * As scroll progresses through the section, the framed image expands
 * from a card-sized 16:10 photo into a full-bleed cover image.
 * Reverses naturally when scrolling back up. On small screens we render
 * a simple non-pinned variant for performance.
 */
export function ShowroomScroll() {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  })

  // Smooth the progress curve so the expansion isn't 1:1 jittery
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  const width = useTransform(p, [0, 0.7], ["min(900px, 78vw)", "100vw"])
  // Stop expanding at the sticky stage's available height (viewport minus the
  // 120px sticky main bar). Plain calc() — no CSS var — so framer-motion's
  // interpolator can resolve start/end into the same unit space and tween
  // smoothly. Using var() here breaks the curve. Keep this 120 in sync with
  // --tfi-header-mainbar-h in tfi-extras.css.
  const height = useTransform(p, [0, 0.7], ["min(54vh, 540px)", "calc(100vh - 120px)"])
  const radius = useTransform(p, [0, 0.7], [8, 0])
  const overlay = useTransform(p, [0, 0.45, 0.7], [0.55, 0.35, 0.55])
  const titleScrim = useTransform(p, [0, 0.3, 0.45], [0.45, 0.25, 0])
  const titleOpacity = useTransform(p, [0, 0.18, 0.45], [1, 1, 0])
  const titleY = useTransform(p, [0, 0.45], [0, -40])
  const captionOpacity = useTransform(p, [0.45, 0.7], [0, 1])
  const captionY = useTransform(p, [0.45, 0.7], [30, 0])

  // Non-pinned simpler version for reduced motion or mobile
  if (reduce) {
    return (
      <section
        ref={wrapRef}
        className="showroom-static"
        style={{ position: "relative" }}
      >
        <div className="tfi-section-eyebrow">
          <span className="t-eyebrow" style={{ color: "var(--tfi-cream)" }}>
            <span className="diamond">◆</span>Showroom
          </span>
        </div>
        <div className="showroom-static__row">
          <div>
            <h2 className="showroom-static__title">Visit Our Birmingham<br />Showroom.</h2>
            <Link href="/contact" className="tfi-pill">
              <span className="arrow">↳</span>Visit the showroom
            </Link>
          </div>
          <div className="showroom-static__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/image2.jpg"
              alt="TFi showroom"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={wrapRef} className="showroom-pin" style={{ position: "relative" }}>
      <div className="showroom-pin__sticky">
        <div className="showroom-pin__eyebrow">
          <Reveal>
            <span className="t-eyebrow" style={{ color: "var(--tfi-cream)" }}>
              <span className="diamond">◆</span>Showroom
            </span>
          </Reveal>
        </div>

        <div className="showroom-pin__title-wrap">
          <motion.div
            className="showroom-pin__title"
            style={{ opacity: titleOpacity, y: titleY }}
          >
            <Reveal><span>Visit Our Birmingham</span></Reveal>
            <br />
            <Reveal delay={0.08}><span>Showroom.</span></Reveal>
          </motion.div>
        </div>

        <motion.figure
          className="showroom-pin__frame"
          style={{ width, height, borderRadius: radius }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/image2.jpg"
            alt="TFi showroom — Birmingham"
            loading="lazy"
          />
          <motion.span className="showroom-pin__overlay" style={{ opacity: overlay }} aria-hidden />
          <motion.span className="showroom-pin__title-scrim" style={{ opacity: titleScrim }} aria-hidden />
          <motion.figcaption
            className="showroom-pin__caption"
            style={{ opacity: captionOpacity, y: captionY }}
          >
            <FadeUp>
              <div className="lbl">Birmingham · Hamstead</div>
              <div className="val">Austin Way, Hamstead<br />Birmingham B42 1AD, United Kingdom</div>
              <Link href="/contact" className="tfi-pill" style={{ marginTop: 18 }}>
                <span className="arrow">↳</span>Plan a visit
              </Link>
            </FadeUp>
          </motion.figcaption>
        </motion.figure>
      </div>
    </section>
  )
}
