import Link from "next/link"
import Image from "next/image"

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const serviceLinks = [
  { href: "/services#flooring", label: "Flooring Solutions" },
  { href: "/services#paneling", label: "Wall Paneling" },
  { href: "/services#kitchen", label: "Kitchen Solutions" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex">
              <Image
                src="/assets/TFI.png"
                alt="TFi Floors & Interiors"
                width={200}
                height={200}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Crafting premium interior spaces through exceptional flooring, wall paneling, and
              bespoke kitchen solutions. Every material chosen with intention.
            </p>
            <div className="flex gap-5 mt-7">
              <a
                href="#"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                <IconInstagram />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                <IconFacebook />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                <IconLinkedin />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-8 mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
              Contact
            </h4>
            <address className="not-italic space-y-3 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                123 Design District,<br />
                Clifton, Karachi 75600<br />
                Pakistan
              </p>
              <p>
                <a
                  href="tel:+923001234567"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  +92 300 123 4567
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@tfi.pk"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  hello@tfi.pk
                </a>
              </p>
              <p className="pt-1 text-xs text-muted-foreground/70">
                Mon–Sat: 10am – 7pm
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground/60 tracking-wide">
            © 2026 TFi Floors & Interior. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 tracking-[0.12em]">
            Crafted with intention.
          </p>
        </div>
      </div>
    </footer>
  )
}
