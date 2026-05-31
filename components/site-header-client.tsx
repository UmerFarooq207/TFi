"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu as MenuIcon,
  Phone,
  Search,
  ShoppingBag,
  Star,
  Truck,
  Package,
  Award,
  ShieldCheck,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import { useAuth } from "@/components/auth-provider"
import type { Taxonomy, TaxonomyCategory } from "@/lib/data/taxonomy"

const PHONE_DISPLAY = "0121 328 5391"
const PHONE_HREF = "tel:+441213285391"

const TRUST_ITEMS = [
  { icon: Truck,       title: "Fast Delivery",            sub: "5–7 days nationwide" },
  { icon: Package,     title: "Free Samples",             sub: "Try before you buy" },
  { icon: Award,       title: "Birmingham's Largest",     sub: "Flooring supplier" },
  { icon: Star,        title: "4.9 / 5 Reviews",          sub: "Trusted by 2,000+" },
  { icon: ShieldCheck, title: "Premium Quality",          sub: "15-year warranty" },
]

/**
 * Cart count. Zustand `persist` rehydrates after mount, so both SSR and the
 * first client render see the initial empty cart and agree — no hydration
 * mismatch, no mounted-flag needed. Subsequent rehydration triggers a re-render.
 */
function useCartCount() {
  return useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
}

export function SiteHeaderClient({ taxonomy }: { taxonomy: Taxonomy }) {
  const router = useRouter()
  const pathname = usePathname()

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  /** Mobile-only: search bar slides down as an overlay when the search icon is tapped. */
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Search form state — free text only. Suggestions are derived from taxonomy.
  const [searchTerm, setSearchTerm] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)

  const cartCount = useCartCount()
  const toggleCart = useCartStore((s) => s.toggleCart)

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const searchRef = useRef<HTMLDivElement | null>(null)

  /**
   * All keywords we can suggest against, flattened from the taxonomy that the
   * mega menu already loaded. Each entry knows exactly what URL it navigates
   * to so the products page lands with the right filter pre-applied. Built
   * once per taxonomy snapshot.
   */
  type Suggestion = {
    label: string
    kind: "category" | "collection" | "brand" | "color" | "pattern"
    /** Sublabel shown right of the suggestion to disambiguate (e.g. "in Flooring"). */
    hint?: string
    url: string
  }
  const allSuggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = []
    for (const cat of taxonomy.categories) {
      list.push({
        label: cat.label,
        kind: "category",
        url: `/products?category=${cat.slug}`,
      })
      for (const col of cat.collections) {
        list.push({
          label: col.name,
          kind: "collection",
          hint: `in ${cat.label}`,
          url: `/products?category=${cat.slug}&collection=${encodeURIComponent(col.name)}`,
        })
      }
      for (const color of cat.colors) {
        list.push({
          label: color,
          kind: "color",
          hint: `${cat.label} colour`,
          // No URL-driven colour filter on the products page; route via free-text
          // search scoped to the category — the API regex-matches `color` too.
          url: `/products?category=${cat.slug}&search=${encodeURIComponent(color)}`,
        })
      }
      for (const pat of cat.patterns) {
        list.push({
          label: pat,
          kind: "pattern",
          hint: `${cat.label} pattern`,
          url: `/products?category=${cat.slug}&search=${encodeURIComponent(pat)}`,
        })
      }
    }
    for (const brand of taxonomy.brands) {
      list.push({
        label: brand.name,
        kind: "brand",
        url: `/products?brand=${encodeURIComponent(brand.name)}`,
      })
    }
    return list
  }, [taxonomy])

  /**
   * Up to 8 matches against the typed term. Ranks "starts with" above
   * "contains", and dedupes by (kind, lower-cased label) so the same colour
   * appearing in multiple categories doesn't flood the list.
   */
  const suggestions = useMemo<Suggestion[]>(() => {
    const q = searchTerm.trim().toLowerCase()
    if (q.length < 1) return []
    const starts: Suggestion[] = []
    const contains: Suggestion[] = []
    const seen = new Set<string>()
    for (const s of allSuggestions) {
      const key = `${s.kind}:${s.label.toLowerCase()}`
      if (seen.has(key)) continue
      const l = s.label.toLowerCase()
      if (l.startsWith(q)) {
        seen.add(key)
        starts.push(s)
      } else if (l.includes(q)) {
        seen.add(key)
        contains.push(s)
      }
    }
    return [...starts, ...contains].slice(0, 8)
  }, [allSuggestions, searchTerm])

  // Compact-on-scroll. Collapse to mainbar-only once the page is meaningfully
  // scrolled. A class is set on <html> so CSS can target the topbar (sibling
  // of the header) and the spacer (precedes both). Hysteresis (32px to engage,
  // 8px to release) prevents a flicker if the user hovers right at the edge.
  useEffect(() => {
    const ENGAGE = 32
    const RELEASE = 8
    let raf = 0
    let engaged = false
    const tick = () => {
      raf = 0
      const y = window.scrollY
      if (!engaged && y > ENGAGE) {
        engaged = true
        setScrolled(true)
      } else if (engaged && y < RELEASE) {
        engaged = false
        setScrolled(false)
      }
    }
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  // Mirror `scrolled` onto <html> so global selectors can react. Cleaned up
  // on unmount so it doesn't leak into admin/auth routes.
  useEffect(() => {
    document.documentElement.classList.toggle("tfi-scrolled", scrolled)
    return () => document.documentElement.classList.remove("tfi-scrolled")
  }, [scrolled])

  // Close mega-menu / mobile drawer on route change. This is the canonical
  // "sync UI state to an external system (router)" case — the React 19 linter
  // flags any setState-in-effect, but here it's the intended pattern.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setActiveCat(null)
    setMobileOpen(false)
    setMobileSearchOpen(false)
    setSearchOpen(false)
    setActiveSuggestion(-1)
    setSearchTerm("")
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname])

  // Close the search-suggestions panel on outside click.
  useEffect(() => {
    if (!searchOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest("[data-search-root]")) {
        setSearchOpen(false)
        setActiveSuggestion(-1)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [searchOpen])

  // Reset highlighted suggestion when the matched list changes.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setActiveSuggestion(-1)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchTerm])

  const openCat = useCallback((slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveCat(slug)
  }, [])

  const queueCloseCat = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    // Small grace period so the user can move from trigger to panel without it shutting.
    closeTimer.current = setTimeout(() => setActiveCat(null), 120)
  }, [])

  /**
   * Submit handler: if a suggestion is highlighted, follow its URL; otherwise
   * fall back to a free-text search across the product catalogue.
   */
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      router.push(suggestions[activeSuggestion].url)
    } else {
      const q = searchTerm.trim()
      router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products")
    }
    setSearchOpen(false)
    setActiveSuggestion(-1)
  }

  /** Keyboard navigation across the suggestions list. */
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((i) => (i + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === "Escape") {
      setSearchOpen(false)
      setActiveSuggestion(-1)
    }
  }

  const activeCategory: TaxonomyCategory | undefined = useMemo(
    () => taxonomy.categories.find((c) => c.slug === activeCat),
    [activeCat, taxonomy.categories],
  )

  return (
    <>
      {/* Spacer matches the topbar + fixed header height so page content doesn't slide under. */}
      <div className="tfi-site-header-spacer" aria-hidden />

      {/* ───────────────── TOP INFO BAR ─────────────────
          Pulled OUT of <header> and rendered as its own fixed bar pinned to
          top:0. The main <header> below sits at top:36px (topbar height) so
          there is no possible way they can overlap — they are physically
          separate fixed elements with separate top offsets. */}
      <div className="tfi-site-topbar">
        <div className="tfi-site-topbar__inner">
          <span className="tfi-site-topbar__left">
            Since 2008 <span className="tfi-site-topbar__sep">|</span> Celebrating 18 Years of Excellence
          </span>
          <span className="tfi-site-topbar__center">
            <span className="tfi-site-topbar__need">Need help?</span> Call our friendly flooring experts
          </span>
          <a className="tfi-site-topbar__phone" href={PHONE_HREF}>
            <Phone size={14} aria-hidden />
            <span>{PHONE_DISPLAY}</span>
          </a>
        </div>
      </div>

      <header
        ref={headerRef}
        className={cn("tfi-site-header", scrolled && "is-scrolled", activeCat && "is-mega-open")}
        onMouseLeave={queueCloseCat}
      >
        {/* ───────────────── MAIN HEADER ───────────────── */}
        <div
          className="tfi-mainbar"
          data-mobile-search-open={mobileSearchOpen ? "true" : undefined}
        >
          <div className="tfi-mainbar__inner">
            {/* Mobile-only LEFT group: burger + search icon. Mirrors the
                reference layout where MENU/SEARCH sit on the left while the
                logo centres and CALL/BASKET sit on the right. */}
            <div className="tfi-mainbar__left">
              <button
                type="button"
                className="tfi-mainbar__burger tfi-mainbar__burger--mobile"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon size={22} aria-hidden />
              </button>
              <button
                type="button"
                className="tfi-mainbar__search-toggle"
                aria-label={mobileSearchOpen ? "Close search" : "Open search"}
                aria-expanded={mobileSearchOpen}
                onClick={() => setMobileSearchOpen((v) => !v)}
              >
                {mobileSearchOpen ? <X size={22} aria-hidden /> : <Search size={22} aria-hidden />}
              </button>
            </div>

            <Link href="/" className="tfi-mainbar__logo" aria-label="TFi Floors & Interiors — home">
              <Image
                src="/assets/TFi-logo.png"
                alt="TFi Floors & Interiors"
                width={200}
                height={80}
                priority
                className="tfi-mainbar__logo-img"
              />
            </Link>

            {/* Search — desktop & tablet. Typeahead from taxonomy; hidden on small mobile. */}
            <div className="tfi-search" data-search-root ref={searchRef}>
              <form className="tfi-search__form" onSubmit={onSearch} role="search">
                <input
                  className="tfi-search__input"
                  type="search"
                  role="combobox"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSearchOpen(true)
                  }}
                  onFocus={() => searchTerm.length > 0 && setSearchOpen(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search Colour, Brand or Product Name"
                  aria-label="Search products"
                  aria-autocomplete="list"
                  aria-controls="tfi-search-suggestions"
                  aria-expanded={searchOpen && suggestions.length > 0}
                  autoComplete="off"
                />
                <button type="submit" className="tfi-search__submit" aria-label="Search">
                  <Search size={18} aria-hidden />
                </button>
              </form>

              {searchOpen && searchTerm.trim().length > 0 && (
                <div
                  id="tfi-search-suggestions"
                  className="tfi-search__suggest"
                  role="listbox"
                >
                  {suggestions.length > 0 ? (
                    <ul className="tfi-search__suggest-list">
                      {suggestions.map((s, i) => (
                        <li key={`${s.kind}-${s.label}-${i}`}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={i === activeSuggestion}
                            className={cn(
                              "tfi-search__suggest-item",
                              i === activeSuggestion && "is-active",
                            )}
                            onMouseEnter={() => setActiveSuggestion(i)}
                            onClick={() => {
                              router.push(s.url)
                              setSearchOpen(false)
                              setActiveSuggestion(-1)
                            }}
                          >
                            <span className={`tfi-search__suggest-kind tfi-search__suggest-kind--${s.kind}`}>
                              {s.kind === "category" && "Category"}
                              {s.kind === "collection" && "Collection"}
                              {s.kind === "brand" && "Brand"}
                              {s.kind === "color" && "Colour"}
                              {s.kind === "pattern" && "Pattern"}
                            </span>
                            <span className="tfi-search__suggest-label">{s.label}</span>
                            {s.hint && <span className="tfi-search__suggest-hint">{s.hint}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="tfi-search__suggest-empty">
                      No matches. Press Enter to search all products for &ldquo;{searchTerm.trim()}&rdquo;.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="tfi-mainbar__actions">
              {/* Mobile-only call icon — quick-dial to sales line. */}
              <a
                href={PHONE_HREF}
                className="tfi-mainbar__call"
                aria-label={`Call ${PHONE_DISPLAY}`}
              >
                <Phone size={20} aria-hidden />
              </a>

              <Link href="/contact" className="tfi-mainbar__quote">
                Get a Quote
              </Link>

              <button
                type="button"
                onClick={() => toggleCart()}
                className="tfi-mainbar__cart"
                aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              >
                <ShoppingBag size={20} aria-hidden />
                {cartCount > 0 && <span className="tfi-mainbar__cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
              </button>

              {/* Desktop-only burger. Mobile burger is in the .tfi-mainbar__left
                  group on the opposite side of the bar. Both buttons control the
                  same Sheet via shared `mobileOpen` state. */}
              <button
                type="button"
                className="tfi-mainbar__burger tfi-mainbar__burger--desktop"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon size={22} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Single Sheet controlled by `mobileOpen` — opened by either the
            mobile-left burger or the desktop-right burger. */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="tfi-site-menu" showCloseButton={false}>
            <SheetTitle className="sr-only">Site menu</SheetTitle>
            <SheetDescription className="sr-only">
              Primary navigation. Switch between the Menu tab (site pages) and the Products tab (categories and filters).
            </SheetDescription>
            <SiteMenu taxonomy={taxonomy} onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* ───────────────── MEGA NAV ───────────────── */}
        <nav className="tfi-meganav" aria-label="Product categories">
          <ul className="tfi-meganav__list">
            {taxonomy.categories.map((cat) => (
              <li
                key={cat.slug}
                className={cn("tfi-meganav__item", activeCat === cat.slug && "is-active")}
                onMouseEnter={() => openCat(cat.slug)}
                onMouseLeave={queueCloseCat}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="tfi-meganav__link"
                  onClick={() => setActiveCat(null)}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
            <li className="tfi-meganav__item tfi-meganav__item--accent">
              <Link href="/products?featured=true" className="tfi-meganav__link" onClick={() => setActiveCat(null)}>
                Best Sellers
              </Link>
            </li>
          </ul>
        </nav>

        {/* ───────────────── MEGA PANEL ───────────────── */}
        {activeCategory && (
          <div
            className="tfi-megapanel"
            onMouseEnter={() => openCat(activeCategory.slug)}
            onMouseLeave={queueCloseCat}
          >
            <div className="tfi-megapanel__inner">
              {/* LEFT — facet rail */}
              <aside className="tfi-megapanel__rail">
                <Link
                  href={`/products?category=${activeCategory.slug}`}
                  className="tfi-megapanel__rail-all"
                  onClick={() => setActiveCat(null)}
                >
                  View All {activeCategory.label}
                  <ChevronRight size={14} aria-hidden />
                </Link>

                {activeCategory.collections.length > 0 && (
                  <RailGroup title="Shop by Collection">
                    {activeCategory.collections.map((col) => (
                      <RailLink
                        key={col.name}
                        href={`/products?category=${activeCategory.slug}&collection=${encodeURIComponent(col.name)}`}
                        onClick={() => setActiveCat(null)}
                      >
                        {col.name}
                      </RailLink>
                    ))}
                  </RailGroup>
                )}

                {activeCategory.colors.length > 0 && (
                  <RailGroup title="Shop by Colour">
                    {activeCategory.colors.slice(0, 6).map((color) => (
                      <RailLink
                        key={color}
                        href={`/products?category=${activeCategory.slug}&color=${encodeURIComponent(color)}`}
                        onClick={() => setActiveCat(null)}
                      >
                        {color}
                      </RailLink>
                    ))}
                  </RailGroup>
                )}

                {activeCategory.brands.length > 0 && (
                  <RailGroup title="Shop by Brand">
                    {activeCategory.brands.slice(0, 6).map((b) => (
                      <RailLink
                        key={b}
                        href={`/products?category=${activeCategory.slug}&brand=${encodeURIComponent(b)}`}
                        onClick={() => setActiveCat(null)}
                      >
                        {b}
                      </RailLink>
                    ))}
                  </RailGroup>
                )}

                {activeCategory.thicknesses.length > 0 && (
                  <RailGroup title="Shop by Thickness">
                    {activeCategory.thicknesses.map((t) => (
                      <RailLink
                        key={t}
                        href={`/products?category=${activeCategory.slug}&thickness=${t}`}
                        onClick={() => setActiveCat(null)}
                      >
                        {t} mm
                      </RailLink>
                    ))}
                  </RailGroup>
                )}
              </aside>

              {/* RIGHT — collection cards */}
              <div className="tfi-megapanel__main">
                <div className="tfi-megapanel__heading">
                  <h2>Shop Popular Ranges</h2>
                  <p>{activeCategory.label}</p>
                </div>

                {activeCategory.collections.length > 0 ? (
                  <div className="tfi-megapanel__cards">
                    {activeCategory.collections.slice(0, 4).map((col) => (
                      <Link
                        key={col.name}
                        href={`/products?category=${activeCategory.slug}&collection=${encodeURIComponent(col.name)}`}
                        className="tfi-collection-card"
                        onClick={() => setActiveCat(null)}
                      >
                        <div className="tfi-collection-card__media">
                          {col.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={col.image} alt={col.name} loading="lazy" />
                          ) : (
                            <div className="tfi-collection-card__placeholder" aria-hidden />
                          )}
                          <span className="tfi-collection-card__pill">{col.name}</span>
                        </div>
                        <div className="tfi-collection-card__body">
                          {col.priceFrom !== null ? (
                            <span className="tfi-collection-card__price">
                              From £{col.priceFrom.toFixed(2)} m²
                            </span>
                          ) : (
                            <span className="tfi-collection-card__price tfi-collection-card__price--muted">
                              View range
                            </span>
                          )}
                          <span className="tfi-collection-card__cta">
                            View products <ArrowRight size={14} aria-hidden />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="tfi-megapanel__empty">
                    No collections in this category yet —{" "}
                    <Link href={`/products?category=${activeCategory.slug}`} onClick={() => setActiveCat(null)}>
                      browse all products
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────── TRUST BAR ───────────────── */}
        <div className="tfi-trustbar">
          <ul className="tfi-trustbar__list">
            {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
              <li key={title} className="tfi-trustbar__item">
                <Icon size={18} aria-hidden className="tfi-trustbar__icon" />
                <span className="tfi-trustbar__title">{title}</span>
                <span className="tfi-trustbar__sub">{sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Click-outside backdrop only when mega panel is open. Doesn't dim — just catches clicks. */}
      {activeCat && (
        <button
          type="button"
          aria-label="Close menu"
          className="tfi-megapanel__backdrop"
          onClick={() => setActiveCat(null)}
        />
      )}
    </>
  )
}

/* ────────────────────────────────────────────────────────────
   Rail helpers (mega-menu left column)
   ──────────────────────────────────────────────────────────── */

function RailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="tfi-megapanel__rail-group">
      <h3 className="tfi-megapanel__rail-title">{title}</h3>
      <ul className="tfi-megapanel__rail-list">{children}</ul>
    </div>
  )
}

function RailLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <li>
      <Link href={href} className="tfi-megapanel__rail-link" onClick={onClick}>
        {children}
      </Link>
    </li>
  )
}

/* ────────────────────────────────────────────────────────────
   Site menu — dark slide-in panel with the canonical site links.
   Shown on every breakpoint (no longer mobile-only). Mirrors the
   legacy TfiDock modal look so the brand voice is consistent.
   ──────────────────────────────────────────────────────────── */

function SiteMenu({ taxonomy, onClose }: { taxonomy: Taxonomy; onClose: () => void }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<"menu" | "products">("menu")
  const [accountOpen, setAccountOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const handleLogout = async () => {
    await logout()
    onClose()
    router.push("/")
    router.refresh()
  }

  const links: { href: string; label: string }[] = [
    { href: "/",                       label: "Home" },
    { href: "/products",               label: "Products" },
    { href: "/products?featured=true", label: "Best Sellers" },
    { href: "/calculator",             label: "Estimate" },
    { href: "/visualizer",             label: "Visualizer" },
    { href: "/contact",                label: "Contact" },
  ]

  return (
    <div className="tfi-site-menu__inner">
      {/* Top tab bar: Menu / Products + close. Matches the reference layout —
          two pill-style tabs on the left, X on the right. */}
      <div className="tfi-site-menu__tabs">
        <div className="tfi-site-menu__tabs-group">
          <button
            type="button"
            className={cn("tfi-site-menu__tab", tab === "menu" && "is-active")}
            onClick={() => setTab("menu")}
          >
            Menu
          </button>
          <button
            type="button"
            className={cn("tfi-site-menu__tab", tab === "products" && "is-active")}
            onClick={() => setTab("products")}
          >
            Products
          </button>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          className="tfi-site-menu__close"
          onClick={onClose}
        >
          <X size={22} aria-hidden />
        </button>
      </div>

      {tab === "menu" ? (
        <ul className="tfi-site-menu__list">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="tfi-site-menu__link"
                onClick={onClose}
              >
                {link.label}
              </Link>
            </li>
          ))}

          <li className={cn("tfi-site-menu__account", accountOpen && "is-open")}>
            <button
              type="button"
              className="tfi-site-menu__account-toggle"
              onClick={() => setAccountOpen((v) => !v)}
              aria-expanded={accountOpen}
            >
              <span>Account</span>
              <span className="tfi-site-menu__account-caret" aria-hidden>
                {accountOpen ? "−" : "+"}
              </span>
            </button>

            {accountOpen && (
              <ul className="tfi-site-menu__account-menu">
                {user ? (
                  <>
                    <li className="tfi-site-menu__account-email">{user.email}</li>
                    {user.role === "admin" && (
                      <li>
                        <Link
                          href="/admin"
                          className="tfi-site-menu__account-link"
                          onClick={onClose}
                        >
                          Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        className="tfi-site-menu__account-link"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      className="tfi-site-menu__account-link"
                      onClick={onClose}
                    >
                      Sign in
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </li>
        </ul>
      ) : (
        <div className="tfi-site-menu__products">
          {taxonomy.categories.map((category) => (
            <CategoryAccordion
              key={category.slug}
              category={category}
              isOpen={openCategory === category.slug}
              onToggle={() =>
                setOpenCategory(openCategory === category.slug ? null : category.slug)
              }
              onClose={onClose}
            />
          ))}
        </div>
      )}

      <div className="tfi-site-menu__contact">
        <a href={PHONE_HREF} className="tfi-site-menu__phone">
          <Phone size={14} aria-hidden /> {PHONE_DISPLAY}
        </a>
        <Link href="/contact" className="tfi-site-menu__quote" onClick={onClose}>
          Get a Quote
        </Link>
      </div>
    </div>
  )
}

/* Per-category accordion used inside the Products tab. Expanding it reveals
   the "View all" link plus four collapsible filter groups (Collection, Colour,
   Brand, Thickness) populated from the taxonomy. Each value navigates to
   /products with the appropriate URL filter applied. */
function CategoryAccordion({
  category,
  isOpen,
  onToggle,
  onClose,
}: {
  category: TaxonomyCategory
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const slug = category.slug
  const sections: { key: string; title: string; items: { name: string; url: string }[] }[] = [
    {
      key: "collections",
      title: "Shop By Collection",
      items: category.collections.map((c) => ({
        name: c.name,
        url: `/products?category=${slug}&collection=${encodeURIComponent(c.name)}`,
      })),
    },
    {
      key: "colors",
      title: "Shop By Colour",
      // No URL-level colour filter on the products page; route through the
      // free-text search scoped to the category — the API regex-matches colour.
      items: category.colors.map((c) => ({
        name: c,
        url: `/products?category=${slug}&search=${encodeURIComponent(c)}`,
      })),
    },
    {
      key: "brands",
      title: "Shop By Brand",
      items: category.brands.map((b) => ({
        name: b,
        url: `/products?brand=${encodeURIComponent(b)}`,
      })),
    },
    {
      key: "thicknesses",
      title: "Shop By Thickness",
      items: category.thicknesses.map((t) => ({
        name: `${t} mm`,
        url: `/products?category=${slug}&thickness=${t}`,
      })),
    },
  ].filter((s) => s.items.length > 0)

  return (
    <div className={cn("tfi-cat-acc", isOpen && "is-open")}>
      <button
        type="button"
        className="tfi-cat-acc__head"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{category.label}</span>
        <ChevronDown
          size={18}
          aria-hidden
          className={cn("tfi-cat-acc__caret", isOpen && "is-open")}
        />
      </button>

      {isOpen && (
        <div className="tfi-cat-acc__body">
          <Link
            href={`/products?category=${slug}`}
            className="tfi-cat-acc__viewall"
            onClick={onClose}
          >
            View All {category.label}
          </Link>

          {sections.map((section) => {
            const open = openSection === section.key
            return (
              <div key={section.key} className={cn("tfi-cat-sub", open && "is-open")}>
                <button
                  type="button"
                  className="tfi-cat-sub__head"
                  onClick={() =>
                    setOpenSection(openSection === section.key ? null : section.key)
                  }
                  aria-expanded={open}
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    size={16}
                    aria-hidden
                    className={cn("tfi-cat-sub__caret", open && "is-open")}
                  />
                </button>
                {open && (
                  <ul className="tfi-cat-sub__list">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <Link href={item.url} className="tfi-cat-sub__link" onClick={onClose}>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
