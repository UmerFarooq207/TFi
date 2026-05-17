import type { Metadata } from "next"
import { ContactForm } from "./contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: { absolute: "Get in Touch — Birmingham Showroom & UK Enquiries | Contact TFi" },
  description:
    "Contact TFi Floors and Interiors on +44 7790 000007 or info@tfifloorsandinteriors.co.uk to discuss your flooring, wall paneling, microcement or bespoke kitchen project. Visit our Birmingham showroom (Hamstead, B42 1AD) — UK residential and trade enquiries answered within one business day.",
  keywords: [
    "contact TFi Floors and Interiors",
    "flooring showroom Birmingham",
    "wall paneling quote UK",
    "kitchen design consultation UK",
    "trade flooring enquiry UK",
    "TFi Birmingham address",
    "interior materials showroom Hamstead",
    "info@tfifloorsandinteriors.co.uk",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Get in Touch — Birmingham Showroom & UK Enquiries | Contact TFi",
    description:
      "Visit our Birmingham flooring and wall paneling showroom or call +44 7790 000007 — UK residential and trade enquiries answered within one business day.",
    url: "/contact",
    type: "website",
  },
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
        <h1>Get in Touch — Birmingham Showroom & UK Enquiries.</h1>

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
                <div>
                  <a href="tel:+447790000007">+44 7790 000007</a>
                </div>
              </div>
              <div>
                <div className="lbl">Email</div>
                <div>
                  <a href="mailto:info@tfifloorsandinteriors.co.uk">
                    info@tfifloorsandinteriors.co.uk
                  </a>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
