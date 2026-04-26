"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useCartStore } from "@/store/cart"

const links = [
  { href: "/",         label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about",    label: "About" },
  { href: "/contact",  label: "Contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 48)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            src="/assets/TFI.png"
            alt="TFi Floors & Interiors"
            width={200}
            height={200}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
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
                src="/assets/TFI.png"
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

            {/* Footer tag */}
            <div className="px-8 pb-10 pt-8">
              <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground/50">
                Crafted with intention.
              </p>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  )
}
