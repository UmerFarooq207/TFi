import { connectToDatabase } from "@/lib/mongodb"
import type { Product, ProductCategory } from "@/lib/models/product"
import { toStoredImageUrl } from "@/lib/image-url"

/**
 * Static labels for the fixed category enum on `Product`.
 * Order here is the order shown in the mega-nav.
 */
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  flooring: "Flooring",
  "decorative-furniture-panel": "Decorative Furniture Panel",
  skirting: "Laminate Flooring Accessories",
  "decorative-wall-covering": "Decorative Wall Covering",
  "furniture-profile": "Furniture Profile",
}

/**
 * Pseudo-category shown in the search filter only — has no Product rows.
 * Spec asks us to surface "Accessories" if it doesn't exist; the closest real
 * category is "skirting" (Laminate Flooring Accessories), so the alias maps to it.
 */
export const ACCESSORIES_ALIAS = { slug: "skirting", label: "Accessories" } as const

export interface TaxonomyCollection {
  name: string
  category: ProductCategory
  /** Lowest price seen on a product in this collection (null if none priced). */
  priceFrom: number | null
  /** First product image in this collection, for mega-menu cards. */
  image: string | null
  /** Product count, used to sort/limit. */
  count: number
}

export interface TaxonomyCategory {
  slug: ProductCategory
  label: string
  /** Up to N most-populated collections in this category. */
  collections: TaxonomyCollection[]
  /** Distinct colors / patterns / thicknesses available — used for left rail filters. */
  colors: string[]
  patterns: string[]
  brands: string[]
  /** mm thickness values (from dimensions.thickness when unit is "mm"). */
  thicknesses: number[]
}

export interface Taxonomy {
  categories: TaxonomyCategory[]
  brands: { name: string; logo: string | null }[]
  /** Category slugs that have at least one product — for the "search by category" dropdown. */
  searchCategories: { slug: string; label: string }[]
}

/** Known brand logos. If the DB has a brand outside this map, we still list it (without a logo). */
const KNOWN_BRAND_LOGOS: Record<string, string> = {
  AGT: "/assets/AGT-logo.png",
  Finfloor: "/assets/Finfloor-logo.webp",
  Finsa: "/assets/Finsa-logo.png",
}

const MAX_COLLECTIONS_PER_CATEGORY = 6
const MAX_FILTER_VALUES = 8

/**
 * One round-trip to Mongo, producing everything the header mega-nav and search need.
 * Falls back to an empty-but-typed shape if the DB is unreachable so the header
 * still renders during dev / outages.
 */
export async function getHeaderTaxonomy(): Promise<Taxonomy> {
  try {
    const { db } = await connectToDatabase()

    const rows = await db
      .collection<Product>("products")
      .find(
        {},
        {
          projection: {
            category: 1,
            collection: 1,
            brand: 1,
            color: 1,
            pattern: 1,
            price: 1,
            images: 1,
            "dimensions.thickness": 1,
            "dimensions.unit": 1,
          },
        },
      )
      .toArray()

    const catMap = new Map<ProductCategory, TaxonomyCategory>()
    const collectionAgg = new Map<
      string,
      { name: string; category: ProductCategory; priceFrom: number | null; image: string | null; count: number }
    >()
    const brandLogos = new Map<string, string | null>()

    const ensureCat = (slug: ProductCategory): TaxonomyCategory => {
      let entry = catMap.get(slug)
      if (!entry) {
        entry = {
          slug,
          label: CATEGORY_LABELS[slug] ?? slug,
          collections: [],
          colors: [],
          patterns: [],
          brands: [],
          thicknesses: [],
        }
        catMap.set(slug, entry)
      }
      return entry
    }

    for (const p of rows) {
      if (!p.category) continue
      const cat = ensureCat(p.category)

      // Collections per category (key by category + collection to avoid cross-category clashes).
      if (p.collection) {
        const key = `${p.category}:::${p.collection}`
        const existing = collectionAgg.get(key)
        const price = typeof p.price === "number" && p.price > 0 ? p.price : null
        // Product images may be stored as Mongo ObjectIds — pipe through the
        // image-url helper so they resolve to `/api/images/<id>` in the browser.
        const rawImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
        const image = rawImage ? toStoredImageUrl(rawImage) : null
        if (existing) {
          existing.count += 1
          if (price !== null) {
            existing.priceFrom = existing.priceFrom === null ? price : Math.min(existing.priceFrom, price)
          }
          if (!existing.image && image) existing.image = image
        } else {
          collectionAgg.set(key, {
            name: p.collection,
            category: p.category,
            priceFrom: price,
            image,
            count: 1,
          })
        }
      }

      // Filter facets.
      if (p.color && !cat.colors.includes(p.color)) cat.colors.push(p.color)
      if (p.pattern && !cat.patterns.includes(p.pattern)) cat.patterns.push(p.pattern)
      if (p.brand && !cat.brands.includes(p.brand)) cat.brands.push(p.brand)
      if (
        p.dimensions &&
        p.dimensions.unit === "mm" &&
        typeof p.dimensions.thickness === "number" &&
        p.dimensions.thickness > 0 &&
        !cat.thicknesses.includes(p.dimensions.thickness)
      ) {
        cat.thicknesses.push(p.dimensions.thickness)
      }

      // Global brand list (for the brand carousel / future use).
      if (p.brand && !brandLogos.has(p.brand)) {
        brandLogos.set(p.brand, KNOWN_BRAND_LOGOS[p.brand] ?? null)
      }
    }

    // Settle collections into their category buckets, sorted by count desc.
    for (const c of collectionAgg.values()) {
      const cat = ensureCat(c.category)
      cat.collections.push(c)
    }
    for (const cat of catMap.values()) {
      cat.collections.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      cat.collections = cat.collections.slice(0, MAX_COLLECTIONS_PER_CATEGORY)
      cat.colors = cat.colors.slice(0, MAX_FILTER_VALUES).sort((a, b) => a.localeCompare(b))
      cat.patterns = cat.patterns.slice(0, MAX_FILTER_VALUES).sort((a, b) => a.localeCompare(b))
      cat.brands = cat.brands.slice(0, MAX_FILTER_VALUES).sort((a, b) => a.localeCompare(b))
      cat.thicknesses = cat.thicknesses.slice(0, MAX_FILTER_VALUES).sort((a, b) => a - b)
    }

    // Categories list: every category from the fixed enum, in the labels order,
    // even if it has zero products yet (so the nav structure is stable).
    const orderedSlugs = Object.keys(CATEGORY_LABELS) as ProductCategory[]
    const categories = orderedSlugs.map((slug) => catMap.get(slug) ?? ensureCat(slug))

    // Search dropdown: include "Accessories" alias as required by the spec.
    const searchCategories: { slug: string; label: string }[] = [
      { slug: "", label: "All Categories" },
      ...orderedSlugs.map((slug) => ({ slug, label: CATEGORY_LABELS[slug] })),
    ]
    const hasAccessories = searchCategories.some((c) => c.label.toLowerCase() === "accessories")
    if (!hasAccessories) {
      // Insert as alias for the closest matching category.
      searchCategories.push({ slug: ACCESSORIES_ALIAS.slug, label: ACCESSORIES_ALIAS.label })
    }

    const brands = Array.from(brandLogos.entries())
      .map(([name, logo]) => ({ name, logo }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return { categories, brands, searchCategories }
  } catch {
    // DB unreachable — return the static enum so nav still renders.
    const orderedSlugs = Object.keys(CATEGORY_LABELS) as ProductCategory[]
    const categories: TaxonomyCategory[] = orderedSlugs.map((slug) => ({
      slug,
      label: CATEGORY_LABELS[slug],
      collections: [],
      colors: [],
      patterns: [],
      brands: [],
      thicknesses: [],
    }))
    const searchCategories = [
      { slug: "", label: "All Categories" },
      ...orderedSlugs.map((slug) => ({ slug, label: CATEGORY_LABELS[slug] })),
      { slug: ACCESSORIES_ALIAS.slug, label: ACCESSORIES_ALIAS.label },
    ]
    return { categories, brands: [], searchCategories }
  }
}
