"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/products": "Collections",
  "/calculator": "Estimate",
  "/contact": "Contact",
  "/cart": "Cart",
  "/checkout": "Checkout",
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

function TfiMonogram() {
  return (
    <Image
      src="/assets/TFI-nav-footer.png"
      alt="TFi"
      width={120}
      height={120}
      priority
      style={{ width: 36, height: 36, objectFit: "contain" }}
    />
  )
}

export function TfiDock() {
  const pathname = usePathname()
  const label = getPageLabel(pathname)

  const [isOpen, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [isClosing, setClosing] = useState(false)
  const autoOpenedRef = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollY = useRef(0)

  const open = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setClosing(false)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setClosing(true)
    setOpen(false)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosing(false), 400)
  }, [])

  const handleDockMenu = () => {
    autoOpenedRef.current = false
    if (isOpen) close()
    else open()
  }

  const handleClose = () => {
    autoOpenedRef.current = false
    close()
  }

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

  useEffect(() => {
    autoOpenedRef.current = false
    setAccountOpen(false)
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

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

  // Auto-close on scroll down
  useEffect(() => {
    lastScrollY.current = window.scrollY
    function onScroll() {
      const y = window.scrollY
      if (isOpen && !autoOpenedRef.current && y > lastScrollY.current + 30) {
        close()
      }
      lastScrollY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isOpen, close])

  const dockClass = ["tfi-dock", isOpen ? "menu-open" : ""].filter(Boolean).join(" ")
  const modalClass = ["tfi-modal", isOpen ? "is-open" : "", isClosing ? "is-closing" : ""].filter(Boolean).join(" ")

  return (
    <>
      <nav className={dockClass} aria-label="Site navigation">
        <Link className="tfi-dock__logo" href="/" aria-label="TFi home">
          <TfiMonogram />
        </Link>
        <button className="tfi-dock__label" type="button" onClick={handleDockMenu}>
          {label}
        </button>
        <button
          className="tfi-dock__burger"
          type="button"
          onClick={handleDockMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

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
          <div className="tfi-modal__eyebrow">Menu</div>
          <ul className="tfi-modal__menu">
            <li><Link href="/" onClick={handleClose}>Home</Link></li>
            <li><Link href="/products" onClick={handleClose}>Collections</Link></li>
            <li><Link href="/calculator" onClick={handleClose}>Estimate</Link></li>
            <li><Link href="/visualizer" onClick={handleClose}>Visualizer</Link></li>
            <li><Link href="/cart" onClick={handleClose}>Cart</Link></li>
            <li><Link href="/contact" onClick={handleClose}>Contact</Link></li>
            <li className={`tfi-modal__account${accountOpen ? " is-open" : ""}`}>
              <button
                type="button"
                className="tfi-modal__account-toggle"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
              >
                Account
                <span className="tfi-modal__account-caret" aria-hidden>{accountOpen ? "−" : "+"}</span>
              </button>
              {accountOpen && (
                <ul className="tfi-modal__account-menu">
                  <li><Link href="/login" onClick={handleClose}>Admin Login</Link></li>
                </ul>
              )}
            </li>
          </ul>
          <div className="tfi-modal__contact">
            <span className="lbl">Phone</span><span className="val">+44 7790 000007</span>
            <span className="lbl">Email</span><span className="val">info@tfifloorsandinteriors.co.uk</span>
          </div>
          <Link href="/contact" className="tfi-pill tfi-modal__cta" onClick={handleClose}>
            <span className="arrow">↳</span>Get a quote
          </Link>
        </div>
        <button
          className="tfi-modal__close"
          type="button"
          onClick={handleClose}
          aria-label="Close menu"
        />
      </div>
    </>
  )
}
