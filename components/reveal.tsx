"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef, type ReactNode } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Mask-reveal text/element: wraps with overflow hidden and lifts the
 * inner content from y:100% to y:0 when it enters the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: "0px 0px -10% 0px" })

  if (reduce) {
    return <span className={className}>{children}</span>
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom",
        lineHeight: "inherit",
        paddingBottom: "0.08em",
      }}
    >
      <motion.span
        style={{ display: "inline-block", willChange: "transform, opacity" }}
        initial={{ y: "110%", opacity: 0 }}
        animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
        transition={{ duration: 0.85, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/**
 * Reveal a block (card, image, container) by lifting + fading.
 */
export function FadeUp({
  children,
  delay = 0,
  y = 32,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -8% 0px" })

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y, opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger children entrance.
 */
export function StaggerGroup({
  children,
  delay = 0,
  stagger = 0.08,
  className,
}: {
  children: ReactNode
  delay?: number
  stagger?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -8% 0px" })

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 28,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
}
