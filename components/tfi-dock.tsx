"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCartStore } from "@/store/cart"

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/products": "Collections",
  "/calculator": "Estimate",
  "/contact": "Contact",
  "/checkout": "Cart",
  "/about": "About",
  "/services": "Services",
  "/visualizer": "Visualizer",
}

function getPageLabel(pathname: string) {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  if (pathname.startsWith("/products/")) return "Product"
  if (pathname.startsWith("/order")) return "Order"
  return "TFi"
}

function TfiMonogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" stroke="currentColor" strokeWidth={1.4} className={className}>
      <path d="M16 3 L27 9 L27 23 L16 29 L5 23 L5 9 Z" fill="none" />
      <path d="M11 12 L20 12 L23 16 L20 20 L11 20 L8 16 Z" />
    </svg>
  )
}

export function TfiDock() {
  const pathname = usePathname()
  const label = getPageLabel(pathname)
  const itemCount = useCartStore((s) => s.getItemCount())

  const [isOpen, setOpen] = useState(false)
  const [isClosing, setClosing] = useState(false)
  const autoOpenedRef = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setClosing(false)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setClosing(true)
    setOpen(false)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosing(false), 360)
  }, [])

  // Manual open from dock button
  const handleDockMenu = () => {
    autoOpenedRef.current = false
    open()
  }

  const handleClose = () => {
    autoOpenedRef.current = false
    close()
  }

  // Footer auto-open via global event from TfiFooter
  useEffect(() => {
    function handleAutoOpen(e: Event) {
      const detail = (e as CustomEvent).detail as { open: boolean } | undefined
      if (detail?.open) {
        autoOpenedRef.current = true
        open()
      } else if (autoOpenedRef.current) {
        autoOpenedRef.current = false
        close()
      }
    }
    window.addEventListener("tfi:footer-menu", handleAutoOpen as EventListener)
    return () => window.removeEventListener("tfi:footer-menu", handleAutoOpen as EventListener)
  }, [open, close])

  // Close on route change
  useEffect(() => {
    autoOpenedRef.current = false
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock scroll while modal open? — keep scroll free so footer auto-close still works
  // ESC closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        autoOpenedRef.current = false
        close()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, close])

  const modalClass = ["tfi-modal", isOpen ? "is-open" : "", isClosing ? "is-closing" : ""].filter(Boolean).join(" ")

  return (
    <>
      {/* Dock */}
      <nav className="tfi-dock" aria-label="Site navigation">
        <Link className="tfi-dock__logo" href="/" aria-label="TFi home">
          <TfiMonogram />
        </Link>
        <button className="tfi-dock__label" type="button" onClick={handleDockMenu}>
          {label}
        </button>
        <button
          className="tfi-dock__menu"
          type="button"
          onClick={handleDockMenu}
          aria-label="Open menu"
          aria-expanded={isOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </button>
      </nav>

      {/* Modal */}
      <div
        className={modalClass}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <div className="tfi-modal__panel">
          <button className="tfi-modal__close" type="button" onClick={handleClose} aria-label="Close menu">
            ×
          </button>
          <div className="t-eyebrow" style={{ color: "var(--tfi-mute-dark)" }}>
            Menu
          </div>
          <ul className="tfi-modal__menu">
            <li><Link href="/" onClick={handleClose}>Home</Link></li>
            <li><Link href="/products" onClick={handleClose}>Collections</Link></li>
            <li><Link href="/calculator" onClick={handleClose}>Estimate</Link></li>
            <li><Link href="/contact" onClick={handleClose}>Contact</Link></li>
            <li>
              <Link href="/checkout" onClick={handleClose}>
                Cart
                {itemCount > 0 && <span className="tfi-cart-pill">{itemCount}</span>}
              </Link>
            </li>
          </ul>
          <div className="tfi-modal__contact">
            <span className="lbl">Phone</span><span className="val">+92 300 123 4567</span>
            <span className="lbl">Showroom</span><span className="val">hello@tfi.pk</span>
          </div>
          <Link href="/contact" className="tfi-pill tfi-modal__cta" onClick={handleClose}>
            <span className="arrow">↳</span>Get a quote
          </Link>
        </div>
      </div>
    </>
  )
}
