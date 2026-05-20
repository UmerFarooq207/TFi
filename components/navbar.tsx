"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogIn, LogOut, Menu, User, LayoutDashboard, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import type { Product } from "@/lib/models/product"

const TAIL_LINKS = [
  { href: "/visualizer", label: "Visualizer" },
  { href: "/calculator", label: "Calculator" },
  { href: "/services",   label: "Services" },
  { href: "/about",      label: "About" },
  { href: "/contact",    label: "Contact" },
]

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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const [panel, setPanel] = useState<Panel>(null)
  const [panelCat, setPanelCat] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collectionsByCat, setCollectionsByCat] = useState<Record<string, string[]>>({})

  useEffect(() => {
    setScrolled(window.scrollY > 48)
    const handleScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Build collections-per-category for the drill-down
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

  // Close everything on route change
  useEffect(() => {
    setPanel(null)
    setPanelCat(null)
    setMobileOpen(false)
  }, [pathname])

  const closeAll = () => {
    setPanel(null)
    setPanelCat(null)
    setMobileOpen(false)
  }
  const togglePanel = (p: Exclude<Panel, null>) => {
    setPanelCat(null)
    setPanel((prev) => (prev === p ? null : p))
  }
  const catLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug

  const handleLogout = async () => {
    await logout()
    closeAll()
    router.push("/")
    router.refresh()
  }

  const navLinkClass = (active: boolean) =>
    cn(
      "relative text-xs tracking-[0.18em] uppercase transition-colors duration-200 group",
      active ? "text-accent" : "text-muted-foreground hover:text-foreground"
    )

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled || panel
          ? "bg-background/95 backdrop-blur-md border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/assets/TFiLogo.png"
            alt="TFi Floors & Interiors"
            width={200}
            height={200}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
            <span className={cn("absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300", pathname === "/" ? "w-full" : "w-0 group-hover:w-full")} />
          </Link>

          <div className={cn(navLinkClass(panel === "products" || pathname === "/products"), "flex items-center gap-1")}>
            <Link href="/products" onClick={closeAll}>Products</Link>
            <button type="button" onClick={() => togglePanel("products")} aria-label="Toggle products menu" aria-expanded={panel === "products"} className="flex items-center">
              <ChevronDown size={13} className={cn("transition-transform duration-200", panel === "products" && "rotate-180")} />
            </button>
          </div>

          <button type="button" onClick={() => togglePanel("brands")} className={cn(navLinkClass(panel === "brands"), "flex items-center gap-1")}>
            Brands
            <ChevronDown size={13} className={cn("transition-transform duration-200", panel === "brands" && "rotate-180")} />
          </button>

          {TAIL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(pathname === link.href)}>
              {link.label}
              <span className={cn("absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300", pathname === link.href ? "w-full" : "w-0 group-hover:w-full")} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Auth menu (desktop) */}
          <div className="hidden md:flex items-center">
            {loading ? (
              <div className="h-5 w-5" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors p-1" aria-label="Account menu">
                    <User size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70">
                    {user.name}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="pt-0 text-xs font-normal text-foreground/80 truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard size={14} className="mr-2" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut size={14} className="mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase text-foreground/70 hover:text-foreground transition-colors">
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu — shadcn Sheet */}
          <Sheet open={mobileOpen} onOpenChange={(o) => { setMobileOpen(o); if (!o) { setPanel(null); setPanelCat(null) } }}>
            <SheetTrigger asChild>
              <button className="md:hidden text-foreground/80 hover:text-foreground transition-colors p-1" aria-label="Open menu">
                <Menu size={20} />
              </button>
            </SheetTrigger>

            <SheetContent side="right" showCloseButton={true} className="w-full sm:w-[340px] bg-background border-l border-border/40 flex flex-col p-0">
              <div className="flex items-center px-8 pt-8 pb-4">
                <Image src="/assets/TFiLogo.png" alt="TFi Floors & Interiors" width={200} height={200} className="h-12 w-auto object-contain" />
              </div>

              <div className="flex-1 overflow-y-auto px-8 pt-4">
                {/* Root list */}
                {panel === null && (
                  <nav className="flex flex-col">
                    <Link href="/" onClick={closeAll} className={cn("block py-5 border-b border-border/40 font-heading text-3xl font-medium tracking-wide transition-colors", pathname === "/" ? "text-accent" : "text-foreground/80 hover:text-foreground")}>
                      Home
                    </Link>
                    <div className="flex items-center justify-between border-b border-border/40 text-foreground/80">
                      <Link href="/products" onClick={closeAll} className="flex-1 py-5 font-heading text-3xl font-medium tracking-wide hover:text-foreground">
                        Products
                      </Link>
                      <button type="button" onClick={() => { setPanelCat(null); setPanel("products") }} aria-label="Browse product categories" className="py-5 pl-4 hover:text-foreground">
                        <ChevronRight size={22} className="opacity-50" />
                      </button>
                    </div>
                    <button type="button" onClick={() => setPanel("brands")} className="flex items-center justify-between py-5 border-b border-border/40 font-heading text-3xl font-medium tracking-wide text-foreground/80 hover:text-foreground">
                      Brands <ChevronRight size={22} className="opacity-50" />
                    </button>
                    {TAIL_LINKS.map((link) => (
                      <Link key={link.href} href={link.href} onClick={closeAll} className={cn("block py-5 border-b border-border/40 font-heading text-3xl font-medium tracking-wide transition-colors", pathname === link.href ? "text-accent" : "text-foreground/80 hover:text-foreground")}>
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                )}

                {/* Products → categories */}
                {panel === "products" && !panelCat && (
                  <div className="flex flex-col">
                    <button type="button" onClick={() => setPanel(null)} className="flex items-center gap-2 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
                      <ArrowLeft size={14} /> Menu
                    </button>
                    <Link href="/products" onClick={closeAll} className="block py-3 text-[11px] tracking-[0.2em] uppercase text-accent hover:underline">
                      View all products
                    </Link>
                    {CATEGORIES.map((c) => (
                      <div key={c.slug} className="flex items-center justify-between border-b border-border/40 text-lg text-foreground/85">
                        <Link href={`/products?category=${c.slug}`} onClick={closeAll} className="flex-1 py-4 hover:text-foreground">
                          {c.label}
                        </Link>
                        <button type="button" onClick={() => setPanelCat(c.slug)} aria-label={`Show ${c.label} collections`} className="py-4 pl-4 hover:text-foreground">
                          <ChevronRight size={18} className="opacity-50" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products → collections */}
                {panel === "products" && panelCat && (
                  <div className="flex flex-col">
                    <button type="button" onClick={() => setPanelCat(null)} className="flex items-center gap-2 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
                      <ArrowLeft size={14} /> {catLabel(panelCat)}
                    </button>
                    <Link href={`/products?category=${panelCat}`} onClick={closeAll} className="block py-3 text-[11px] tracking-[0.2em] uppercase text-accent hover:underline">
                      View all {catLabel(panelCat)}
                    </Link>
                    {(collectionsByCat[panelCat] ?? []).map((col) => (
                      <Link key={col} href={`/products?category=${panelCat}&collection=${encodeURIComponent(col)}`} onClick={closeAll} className="block py-4 border-b border-border/40 text-lg text-foreground/85 hover:text-foreground">
                        {col}
                      </Link>
                    ))}
                    {(collectionsByCat[panelCat] ?? []).length === 0 && (
                      <p className="py-4 text-sm text-muted-foreground">No collections yet.</p>
                    )}
                  </div>
                )}

                {/* Brands */}
                {panel === "brands" && (
                  <div className="flex flex-col">
                    <button type="button" onClick={() => setPanel(null)} className="flex items-center gap-2 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
                      <ArrowLeft size={14} /> Menu
                    </button>
                    {BRANDS.map((b) => (
                      <Link key={b.name} href={`/products?brand=${encodeURIComponent(b.name)}`} onClick={closeAll} className="flex items-center gap-4 py-5 border-b border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.logo} alt={b.name} className="h-9 w-auto max-w-[120px] object-contain" />
                        <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground ml-auto">Shop</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth section */}
              <div className="px-8 pb-8 pt-6 border-t border-border/40">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70">Signed in as</p>
                    <p className="text-sm text-foreground truncate">{user.email}</p>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={closeAll} className="block text-xs tracking-[0.18em] uppercase text-accent hover:underline">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="text-xs tracking-[0.18em] uppercase text-foreground/70 hover:text-foreground">
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-xs tracking-[0.18em] uppercase">
                    <Link href="/login" onClick={closeAll} className="text-accent hover:underline">Sign in</Link>
                    <span className="text-muted-foreground/50">·</span>
                    <Link href="/signup" onClick={closeAll} className="text-foreground/70 hover:text-foreground">Create account</Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ============ DESKTOP DRILL-DOWN PANEL ============ */}
      {panel && (
        <div className="hidden md:block">
          <div className="fixed inset-0 top-16 z-40" onClick={closeAll} aria-hidden />
          <div className="absolute left-0 right-0 top-full z-50 bg-background border-t border-b border-border/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
              {panel === "brands" && (
                <div className="grid grid-cols-3 gap-6">
                  {BRANDS.map((b) => (
                    <Link key={b.name} href={`/products?brand=${encodeURIComponent(b.name)}`} onClick={closeAll} className="flex flex-col items-center justify-center gap-4 py-10 border border-border/40 rounded hover:border-foreground/40 hover:bg-muted/30 transition-colors">
                      <Image src={b.logo} alt={b.name} width={160} height={60} className="h-12 w-auto object-contain opacity-90" />
                      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Shop {b.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {panel === "products" && !panelCat && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/70">Shop by category</span>
                    <Link href="/products" onClick={closeAll} className="text-[11px] tracking-[0.18em] uppercase text-accent hover:underline">View all products</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12">
                    {CATEGORIES.map((c) => (
                      <div key={c.slug} className="flex items-center justify-between py-3.5 border-b border-border/30 text-sm text-foreground/80 group">
                        <Link href={`/products?category=${c.slug}`} onClick={closeAll} className="flex-1 hover:text-foreground">
                          {c.label}
                        </Link>
                        <button type="button" onClick={() => setPanelCat(c.slug)} aria-label={`Show ${c.label} collections`} className="pl-2 hover:text-foreground">
                          <ChevronRight size={15} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {panel === "products" && panelCat && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => setPanelCat(null)} className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground">
                      <ArrowLeft size={14} /> {catLabel(panelCat)}
                    </button>
                    <Link href={`/products?category=${panelCat}`} onClick={closeAll} className="text-[11px] tracking-[0.18em] uppercase text-accent hover:underline">
                      View all {catLabel(panelCat)}
                    </Link>
                  </div>
                  {(collectionsByCat[panelCat] ?? []).length > 0 ? (
                    <div className="grid grid-cols-3 gap-x-12">
                      {(collectionsByCat[panelCat] ?? []).map((col) => (
                        <Link key={col} href={`/products?category=${panelCat}&collection=${encodeURIComponent(col)}`} onClick={closeAll} className="block py-3 border-b border-border/30 text-sm text-foreground/80 hover:text-foreground">
                          {col}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No collections in this category yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
