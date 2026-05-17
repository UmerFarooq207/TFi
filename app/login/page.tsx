import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: { absolute: "Admin Sign In | TFi Floors and Interiors" },
  description:
    "Restricted admin sign-in for TFi Floors and Interiors staff to manage products, orders and customer enquiries.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__visual" aria-hidden>
        <div className="auth-shell__image" />
        <div className="auth-shell__visual-overlay" />
        <div className="auth-shell__visual-inner">
          <Link href="/" className="auth-shell__brand">
            <Image
              src="/assets/TFi-logo.png"
              alt="TFi"
              width={520}
              height={200}
              priority
              style={{ width: "auto", height: "clamp(56px, 6vw, 84px)", objectFit: "contain" }}
            />
          </Link>
          <div className="auth-shell__quote">
            <span className="t-eyebrow auth-shell__quote-eyebrow">
              <span className="diamond">◆</span>Floors &amp; Interiors
            </span>
            <p>Considered floors and panels for those who build with intent.</p>
          </div>
        </div>
      </aside>

      <main className="auth-shell__main">
        <div className="auth-shell__panel">
          <Link href="/" className="auth-shell__back">
            ↳ Back to site
          </Link>
          <header className="auth-shell__head">
            <span className="t-eyebrow">
              <span className="diamond">◆</span>Admin access
            </span>
            <h1 className="auth-shell__title">
              Admin sign in<br />to continue.
            </h1>
            <p className="auth-shell__sub">
              Restricted to TFi administrators. Manage products, orders, and inquiries.
            </p>
          </header>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
