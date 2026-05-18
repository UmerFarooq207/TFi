import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display, Inter, Inter_Tight } from "next/font/google"
import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/auth-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const SITE_URL = "https://www.tfifloorsandinteriors.co.uk"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Premium Flooring & Interiors Designed for British Homes | TFi UK",
    template: "%s | TFi Floors and Interiors UK",
  },
  description:
    "TFi Floors and Interiors supplies and installs premium engineered oak flooring, acoustic wall panels, microcement and bespoke kitchens across the UK. Birmingham showroom, nationwide delivery, 15-year commercial warranty.",
  applicationName: "TFi Floors and Interiors",
  keywords: [
    "TFi Floors and Interiors",
    "flooring UK",
    "engineered oak flooring",
    "solid wood flooring UK",
    "luxury vinyl plank",
    "herringbone flooring",
    "chevron flooring",
    "acoustic wall panels UK",
    "slat wall panels",
    "fluted wall panels",
    "microcement surfaces",
    "stone cladding UK",
    "bespoke kitchens UK",
    "premium interior materials",
    "Birmingham flooring showroom",
    "trade flooring supplier UK",
    "nationwide UK flooring delivery",
    "interior design materials",
    "wide plank oak",
    "stair treads and risers",
  ],
  authors: [{ name: "TFi Floors and Interiors", url: SITE_URL }],
  creator: "TFi Floors and Interiors",
  publisher: "TFi Floors and Interiors",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  category: "Home & Garden",
  openGraph: {
    type: "website",
    siteName: "TFi Floors and Interiors",
    title: "Premium Flooring & Interiors Designed for British Homes | TFi UK",
    description:
      "Engineered oak flooring, acoustic wall panels, microcement and bespoke kitchens — supplied and installed UK-wide from our Birmingham showroom.",
    url: SITE_URL,
    locale: "en_GB",
    images: [
      {
        url: "/assets/TFI-nav-footer.png",
        width: 1200,
        height: 630,
        alt: "TFi Floors and Interiors — premium flooring and wall paneling UK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Flooring & Interiors for British Homes | TFi UK",
    description:
      "Engineered oak, acoustic wall panels, microcement and bespoke kitchens — supplied and installed across the UK from Birmingham.",
    images: ["/assets/TFI-nav-footer.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: "TFi Floors and Interiors",
  alternateName: "TFi",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/TFi-logo.png`,
  image: `${SITE_URL}/assets/TFI-nav-footer.png`,
  description:
    "Premium flooring, acoustic wall paneling, microcement surfaces and bespoke kitchens. UK-wide trade supply and installation from our Birmingham showroom.",
  priceRange: "££-£££",
  telephone: "+44 7790 000007",
  email: "info@tfifloorsandinteriors.co.uk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Austin Way, Hamstead",
    addressLocality: "Birmingham",
    postalCode: "B42 1AD",
    addressCountry: "GB",
  },
  areaServed: { "@type": "Country", name: "United Kingdom" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
  ],
  sameAs: [SITE_URL],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${inter.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
