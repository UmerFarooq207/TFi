"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogIn, LogOut, Menu, ShoppingBag, User, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCartStore } from "@/store/cart"
import { useAuth } from "@/components/auth-provider"

const links = [
  { href: "/",           label: "Home" },
  { href: "/products",   label: "Shop" },
  { href: "/visualizer", label: "Visualizer" },
  { href: "/calculator", label: "Calculator" },
  { href: "/services",   label: "Services" },
  { href: "/about",      label: "About" },
  { href: "/contact",    label: "Contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 48)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/88 backdrop-blur-md border-b border-border/50"
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-xs tracking-[0.18em] uppercase transition-colors duration-200 group",
                pathname === link.href
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )}
              />
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
                  <button
                    className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors p-1"
                    aria-label="Account menu"
                  >
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
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase text-foreground/70 hover:text-foreground transition-colors"
              >
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>

          {/* Cart button */}
          <button
            onClick={toggleCart}
            className="relative text-foreground/70 hover:text-foreground transition-colors p-1"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu — shadcn Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden text-foreground/80 hover:text-foreground transition-colors p-1"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              showCloseButton={true}
              className="w-full sm:w-[320px] bg-background border-l border-border/40 flex flex-col p-0"
            >
              {/* Sheet logo */}
              <div className="flex items-center px-8 pt-8 pb-4">
                <Image
                  src="/assets/TFiLogo.png"
                  alt="TFi Floors & Interiors"
                  width={200}
                  height={200}
                  className="h-12 w-auto object-contain"
                />
              </div>

              {/* Nav links */}
              <nav className="flex flex-col px-8 pt-6 gap-0 flex-1">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block py-5 border-b border-border/40 font-heading text-3xl font-medium tracking-wide transition-colors",
                        pathname === link.href
                          ? "text-accent"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Auth section in mobile sheet */}
              <div className="px-8 pb-2 pt-6 border-t border-border/40">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70">
                      Signed in as
                    </p>
                    <p className="text-sm text-foreground truncate">{user.email}</p>
                    {user.role === "admin" && (
                      <SheetClose asChild>
                        <Link
                          href="/admin"
                          className="block text-xs tracking-[0.18em] uppercase text-accent hover:underline"
                        >
                          Admin Panel
                        </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <button
                        onClick={handleLogout}
                        className="text-xs tracking-[0.18em] uppercase text-foreground/70 hover:text-foreground"
                      >
                        Sign out
                      </button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-xs tracking-[0.18em] uppercase">
                    <SheetClose asChild>
                      <Link href="/login" className="text-accent hover:underline">
                        Sign in
                      </Link>
                    </SheetClose>
                    <span className="text-muted-foreground/50">·</span>
                    <SheetClose asChild>
                      <Link href="/signup" className="text-foreground/70 hover:text-foreground">
                        Create account
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>

              {/* Footer tag */}
              <div className="px-8 pb-10 pt-6">
                <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground/50">
                  Crafted with intention.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}
