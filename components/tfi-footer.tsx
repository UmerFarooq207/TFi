"use client"

import { useEffect, useRef } from "react"

function TfiMonogram() {
  return (
    <svg viewBox="0 0 32 32" fill="#fff" stroke="#fff" strokeWidth={1.4}>
      <path d="M16 3 L27 9 L27 23 L16 29 L5 23 L5 9 Z" fill="none" />
      <path d="M11 12 L20 12 L23 16 L20 20 L11 20 L8 16 Z" />
    </svg>
  )
}

export function TfiFooter() {
  const ref = useRef<HTMLElement | null>(null)

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
      { threshold: 0.9 }, // fires when ~90% of footer is visible
    )

    obs.observe(node)
    return () => {
      obs.disconnect()
      dispatch(false)
    }
  }, [])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer ref={ref} id="site-footer" className="tfi-footer">
      <div className="tfi-footer__logo">
        <TfiMonogram />
      </div>
      <div className="tfi-watermark">TFi</div>
      <button
        type="button"
        className="tfi-footer__up"
        onClick={handleScrollTop}
        aria-label="Back to top"
      >
        ↑
      </button>
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
