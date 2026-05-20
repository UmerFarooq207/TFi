"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { Product } from "@/lib/models/product"

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/products": "Products",
  "/calculator": "Estimate",
  "/contact": "Contact",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/about": "About",
  "/services": "Services",
  "/visualizer": "Visualizer",
}

const CATEGORIES = [
  { slug: "flooring",                   label: "Flooring" },
  { slug: "decorative-furniture-panel", label: "Decorative Furniture Panel" },
  { slug: "skirting",                   label: "Laminate Flooring Accessories" },
  { slug: "decorative-wall-covering",   label: "Decorative Wall Covering" },
  { slug: "furniture-profile",          label: "Furniture Profile" },
]

const BRANDS = [
  { name: "AGT",      logo: "/assets/AGT-logo.png" },
  { name: "Finfloor", logo: "/assets/Finfloor-logo.webp" },
  { name: "Finsa",    logo: "/assets/Finsa-logo.png" },
]

type Panel = "products" | "brands" | null

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
  const [panel, setPanel] = useState<Panel>(null)
  const [panelCat, setPanelCat] = useState<string | null>(null)
  const [collectionsByCat, setCollectionsByCat] = useState<Record<string, string[]>>({})
  const autoOpenedRef = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollY = useRef(0)

  const resetDrill = useCallback(() => {
    setPanel(null)
    setPanelCat(null)
  }, [])

  const open = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setClosing(false)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setClosing(true)
    setOpen(false)
    resetDrill()
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosing(false), 400)
  }, [resetDrill])

  const handleDockMenu = () => {
    autoOpenedRef.current = false
    if (isOpen) close()
    else open()
  }

  const handleClose = () => {
    autoOpenedRef.current = false
    close()
  }

  const catLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug

  // Load collections grouped by category for the drill-down
  useEffect(() => {
    let active = true
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (!active || !Array.isArray(data)) return
        const map: Record<string, string[]> = {}
        for (const p of data as Product[]) {
          if (!p.category || !p.collection) continue
          if (!map[p.category]) map[p.category] = []
          if (!map[p.category].includes(p.collection)) map[p.category].push(p.collection)
        }
        setCollectionsByCat(map)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

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

  const back = () => {
    if (panel === "products" && panelCat) setPanelCat(null)
    else setPanel(null)
  }

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
          {panel === null ? (
            <div className="tfi-modal__eyebrow">Menu</div>
          ) : (
            <button type="button" className="tfi-modal__back" onClick={back}>
              ← {panel === "products" && panelCat ? catLabel(panelCat) : "Menu"}
            </button>
          )}

          {/* Root */}
          {panel === null && (
            <ul className="tfi-modal__menu">
              <li><Link href="/" onClick={handleClose}>Home</Link></li>
              <li className="tfi-modal__split">
                <Link href="/products" onClick={handleClose}>Products</Link>
                <button type="button" className="tfi-modal__split-arrow" onClick={() => { setPanelCat(null); setPanel("products") }} aria-label="Browse product categories">
                  <span className="arrow" aria-hidden>→</span>
                </button>
              </li>
              <li>
                <button type="button" className="tfi-modal__drill" onClick={() => setPanel("brands")}>
                  Brands
                </button>
              </li>
              <li><Link href="/calculator" onClick={handleClose}>Estimate</Link></li>
              <li><Link href="/visualizer" onClick={handleClose}>Visualizer</Link></li>
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
          )}

          {/* Products → categories */}
          {panel === "products" && !panelCat && (
            <ul className="tfi-modal__menu tfi-modal__menu--sub">
              <li><Link href="/products" onClick={handleClose} className="tfi-modal__viewall">All Categories</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.slug} className="tfi-modal__split">
                  <Link href={`/products?category=${c.slug}`} onClick={handleClose}>
                    {c.label}
                  </Link>
                  <button type="button" className="tfi-modal__split-arrow" onClick={() => setPanelCat(c.slug)} aria-label={`Show ${c.label} collections`}>
                    <span className="arrow" aria-hidden>→</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Products → collections */}
          {panel === "products" && panelCat && (
            <ul className="tfi-modal__menu tfi-modal__menu--sub">
              <li>
                <Link href={`/products?category=${panelCat}`} onClick={handleClose} className="tfi-modal__viewall">
                  View all {catLabel(panelCat)}
                </Link>
              </li>
              {(collectionsByCat[panelCat] ?? []).map((col) => (
                <li key={col}>
                  <Link href={`/products?category=${panelCat}&collection=${encodeURIComponent(col)}`} onClick={handleClose}>
                    {col}
                  </Link>
                </li>
              ))}
              {(collectionsByCat[panelCat] ?? []).length === 0 && (
                <li className="tfi-modal__empty">No collections yet.</li>
              )}
            </ul>
          )}

          {/* Brands */}
          {panel === "brands" && (
            <ul className="tfi-modal__menu tfi-modal__brands">
              {BRANDS.map((b) => (
                <li key={b.name}>
                  <Link href={`/products?brand=${encodeURIComponent(b.name)}`} onClick={handleClose} className="tfi-modal__brand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.logo} alt={b.name} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {panel === null && (
            <>
              <div className="tfi-modal__contact">
                <span className="lbl">Phone</span><span className="val">+44 7790 000007</span>
                <span className="lbl">Email</span><span className="val">info@tfifloorsandinteriors.co.uk</span>
              </div>
              <Link href="/contact" className="tfi-pill tfi-modal__cta" onClick={handleClose}>
                <span className="arrow">↳</span>Get a quote
              </Link>
            </>
          )}
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
