import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = {
  title: "Create an Account",
}

export default function SignupPage() {
  return (
    <div className="auth-shell auth-shell--reverse">
      <aside className="auth-shell__visual" aria-hidden>
        <div className="auth-shell__image auth-shell__image--alt" />
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
              <span className="diamond">◆</span>Material first
            </span>
            <p>Specified, fitted, and still standing — built for those who build with intent.</p>
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
              <span className="diamond">◆</span>Get started
            </span>
            <h1 className="auth-shell__title">
              Create your<br />account.
            </h1>
            <p className="auth-shell__sub">
              Save selections, unlock trade pricing, and follow your orders end to end.
            </p>
          </header>
          <SignupForm />
        </div>
      </main>
    </div>
  )
}
