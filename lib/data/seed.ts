import { connectToDatabase } from "@/lib/mongodb"
import { mockProducts } from "@/lib/data/products"

async function seed() {
  const { db } = await connectToDatabase()
  const collection = db.collection("products")

  await collection.deleteMany({})
  await collection.insertMany(mockProducts as never[])
  await collection.createIndex({ slug: 1 }, { unique: true })

  console.log(`Seeded ${mockProducts.length} products.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
