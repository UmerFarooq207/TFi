import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { Reveal, FadeUp, StaggerGroup, StaggerItem } from "@/components/reveal"

type CategorySlug = Product["category"]

const CATEGORY_CARDS: {
  slug: CategorySlug
  size: string
  title: string
  subtitle: string
  image: string
  alt: string
}[] = [
  {
    slug: "flooring",
    size: "bc-sm",
    title: "Flooring",
    subtitle: "Return to nature in your living spaces.",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1200&q=70",
    alt: "Premium engineered oak and laminate flooring — TFi Floors and Interiors UK",
  },
  {
    slug: "decorative-furniture-panel",
    size: "bc-lg",
    title: "Decorative Furniture Panel",
    subtitle: "Innovative solutions in every space.",
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=70",
    alt: "Decorative furniture panels — matte and soft-touch cabinet fronts UK",
  },
  {
    slug: "skirting",
    size: "bc-half-l",
    title: "Laminate Flooring Accessories",
    subtitle: "Perfect match with all flooring decors.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=70",
    alt: "Laminate flooring accessories — MDF and solid oak skirting matched to flooring decors UK",
  },
  {
    slug: "decorative-wall-covering",
    size: "bc-half-r",
    title: "Decorative Wall Covering",
    subtitle: "Rich selection of models and colours.",
    image: "https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=1600&q=70",
    alt: "Decorative wall covering — acoustic slat, velvet and stone veneer panels UK",
  },
  {
    slug: "furniture-profile",
    size: "bc-full",
    title: "Furniture Profile",
    subtitle: "Break the boundaries in design.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2000&q=70",
    alt: "Furniture profiles — aluminium edge and solid walnut trim profiles UK",
  },
]

async function getTopCollectionsByCategory(): Promise<Record<string, string[]>> {
  try {
    const { db } = await connectToDatabase()
    const rows = await db
      .collection<Product>("products")
      .aggregate<{ _id: { category: string; collection: string }; count: number }>([
        { $match: { collection: { $nin: [null, ""] } } },
        { $group: { _id: { category: "$category", collection: "$collection" }, count: { $sum: 1 } } },
        { $sort: { count: -1, "_id.collection": 1 } },
      ])
      .toArray()

    const map: Record<string, string[]> = {}
    for (const row of rows) {
      const category = row._id.category
      const collection = row._id.collection
      if (!map[category]) map[category] = []
      if (map[category].length < 3 && !map[category].includes(collection)) {
        map[category].push(collection)
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function CategoryShowcase() {
  const topCollections = await getTopCollectionsByCategory()

  return (
    <section className="collection" data-screen-label="02 Categories">
      <div className="tfi-section-eyebrow">
        <Reveal>
          <span className="t-eyebrow">
            <span className="diamond">◆</span>Product Categories
          </span>
        </Reveal>
      </div>
      <div className="collection__intro">
        <h2>
          <Reveal><span>Premium Surfaces,</span></Reveal>
          <br />
          <Reveal delay={0.08}><span>From Floor to Ceiling.</span></Reveal>
        </h2>
        <FadeUp delay={0.15}>
          <p>
            Five premium categories built around the spaces they go into — flooring,
            decorative furniture panels, laminate flooring accessories, wall coverings and furniture profiles,
            specified for UK homes, studios and commercial fit-outs.
          </p>
        </FadeUp>
      </div>

      <StaggerGroup className="bento" stagger={0.09}>
        {CATEGORY_CARDS.map((card) => {
          const tags = topCollections[card.slug] ?? []
          return (
            <StaggerItem key={card.slug} className={`bento-card ${card.size}`}>
              <Link href={`/products?category=${card.slug}`} className="bento-card__inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.image} alt={card.alt} loading="lazy" />
                <div className="bc-body">
                  <div aria-hidden />
                  <div className="bc-foot">
                    <div className="bc-title">{card.title}</div>
                    <p className="bc-meta">{card.subtitle}</p>
                    {tags.length > 0 && (
                      <div className="bc-tags">
                        {tags.map((tag) => (
                          <span key={tag} className="bc-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}
