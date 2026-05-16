import type { Metadata } from "next"
import { ContactForm } from "./contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with TFi to discuss your flooring, paneling, or surfaces project. We respond within one business day.",
}

export default function ContactPage() {
  return (
    <>
      <div className="tfi-topbar tfi-topbar--on-cream">
        <span className="t-eyebrow">
          <span className="diamond">◆</span>Contact
        </span>
        <Link href="/calculator" className="tfi-link">↳ Estimate calculator</Link>
      </div>

      <section className="ct">
        <h1>Visit the showroom, or send us the room.</h1>

        <div className="ct__grid">
          <div>
            <a
              href="https://maps.app.goo.gl/QqCRAXjHXSwvAeueA"
              target="_blank"
              rel="noopener noreferrer"
              className="ct__map"
              aria-label="Open showroom location in Google Maps"
            >
              <div className="ct__pin">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
              </div>
            </a>
            <div className="ct__addr">
              <div>
                <div className="lbl">Showroom</div>
                <div>
                  Austin Way, Hamstead<br />
                  Birmingham B42 1AD, United Kingdom
                </div>
              </div>
              <div>
                <div className="lbl">Hours</div>
                <div>
                  Mon–Sat · 10–7<br />
                  Sun · by appointment
                </div>
              </div>
              <div>
                <div className="lbl">Phone</div>
                <div>+92 300 123 4567</div>
              </div>
              <div>
                <div className="lbl">Trade</div>
                <div>hello@tfi.pk</div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
