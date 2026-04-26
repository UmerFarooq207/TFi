import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_DB as string

if (!uri) throw new Error("MONGODB_URI is not defined")
if (!dbName) throw new Error("MONGODB_DB is not defined")

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  const client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  const client = await clientPromise
  const db = client.db(dbName)
  return { db, client }
}

export default clientPromise
