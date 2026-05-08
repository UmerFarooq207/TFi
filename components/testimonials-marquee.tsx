"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion"

export type Testimonial = {
  name: string
  role: string
  initials: string
  rating: number
  text: string
}

export function TestimonialsMarquee({
  items,
  speed = 38,
}: {
  items: Testimonial[]
  speed?: number
}) {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const x = useMotionValue(0)
  const paused = useRef(false)

  useEffect(() => {
    if (!trackRef.current) return
    const measure = () => {
      const w = trackRef.current?.scrollWidth ?? 0
      setTrackWidth(w / 2)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [items.length])

  useAnimationFrame((_, delta) => {
    if (reduce || paused.current || trackWidth <= 0) return
    const dx = (speed * delta) / 1000
    let next = x.get() - dx
    if (next <= -trackWidth) next += trackWidth
    x.set(next)
  })

  const doubled = [...items, ...items]

  return (
    <div
      className="marquee"
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
      onTouchStart={() => {
        paused.current = true
      }}
      onTouchEnd={() => {
        paused.current = false
      }}
    >
      <motion.div
        ref={trackRef}
        className="marquee__track marquee__track--js"
        style={{ x }}
      >
        {doubled.map((t, i) => (
          <article className="testimonial" key={`${t.name}-${i}`} aria-hidden={i >= items.length}>
            <div className="testimonial__stars" aria-label={`${t.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n}>{n <= t.rating ? "★" : "☆"}</span>
              ))}
            </div>
            <p className="testimonial__text">&ldquo;{t.text}&rdquo;</p>
            <div className="testimonial__person">
              <div className="testimonial__avatar">{t.initials}</div>
              <div>
                <div className="testimonial__name">{t.name}</div>
                <div className="testimonial__role">{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  )
}
