"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

function TfiMonogram() {
  return (
    <Image
      src="/assets/TFI-nav-footer.png"
      alt="TFi"
      width={320}
      height={320}
      style={{ width: 120, height: 120, objectFit: "contain" }}
    />
  )
}

export function TfiFooter() {
  const ref = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const dispatch = (open: boolean) => {
      window.dispatchEvent(new CustomEvent("tfi:footer-menu", { detail: { open } }))
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            dispatch(true)
          } else {
            dispatch(false)
          }
        }
      },
      { threshold: 0.9 },
    )

    obs.observe(node)
    return () => {
      obs.disconnect()
      dispatch(false)
    }
  }, [])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <footer ref={ref} id="site-footer" className="tfi-footer">
      <div className="tfi-footer__logo">
        <TfiMonogram />
      </div>
      <motion.button
        type="button"
        className="tfi-footer__up"
        onClick={handleScrollTop}
        aria-label="Back to top"
        whileHover={reduce ? undefined : { y: -3, scale: 1.05 }}
        whileTap={reduce ? undefined : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </motion.button>
      <div className="tfi-footer__base">
        <div>
          ©2026, TFi &nbsp;·&nbsp;{" "}
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>{" "}
          &nbsp;{" "}
          <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>{" "}
          &nbsp;{" "}
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
        <div className="links">
          <a href="#">Privacy policy</a>
          <a href="#">Terms</a>
          <a href="#">Trade portal</a>
        </div>
      </div>
    </footer>
  )
}
