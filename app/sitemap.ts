import type { MetadataRoute } from "next"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"

const SITE_URL = "https://www.tfifloorsandinteriors.co.uk"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/services`,   lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/products`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/visualizer`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const { db } = await connectToDatabase()
    const products = await db
      .collection<Product>("products")
      .find({}, { projection: { slug: 1, updatedAt: 1 } })
      .toArray()

    productRoutes = products
      .filter((p) => typeof p.slug === "string" && p.slug.length > 0)
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  } catch {
    // If DB is unreachable at build/request time, fall back to static routes only.
  }

  return [...staticRoutes, ...productRoutes]
}
