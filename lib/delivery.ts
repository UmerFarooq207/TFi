// Showroom: Austin Way, Hamstead, Birmingham B42 1AD
export const STORE_COORDS = { lat: 52.528932, lng: -1.92709 }
export const LOCAL_RADIUS_MILES = 10
export const LOCAL_FEE = 20
export const STANDARD_FEE = 45

export type DeliveryBand = "local" | "uk" | "invalid"

export type DeliveryQuote = {
  fee: number
  band: DeliveryBand
  distanceMiles: number | null
  postcode: string
}

// UK postcode format: AA9A 9AA, A9A 9AA, A9 9AA, A99 9AA, AA9 9AA, AA99 9AA
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

export function isValidUkPostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(postcode.trim())
}

function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.7613 // miles
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export async function quoteDelivery(
  postcode: string,
  signal?: AbortSignal,
): Promise<DeliveryQuote> {
  const trimmed = postcode.trim()
  if (!isValidUkPostcode(trimmed)) {
    return { fee: STANDARD_FEE, band: "invalid", distanceMiles: null, postcode: trimmed }
  }
  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`,
      { signal },
    )
    if (!res.ok) {
      return { fee: STANDARD_FEE, band: "uk", distanceMiles: null, postcode: trimmed }
    }
    const data = await res.json()
    const lat = data?.result?.latitude
    const lng = data?.result?.longitude
    if (typeof lat !== "number" || typeof lng !== "number") {
      return { fee: STANDARD_FEE, band: "uk", distanceMiles: null, postcode: trimmed }
    }
    const distance = haversineMiles(STORE_COORDS, { lat, lng })
    if (distance <= LOCAL_RADIUS_MILES) {
      return { fee: LOCAL_FEE, band: "local", distanceMiles: distance, postcode: trimmed }
    }
    return { fee: STANDARD_FEE, band: "uk", distanceMiles: distance, postcode: trimmed }
  } catch {
    return { fee: STANDARD_FEE, band: "uk", distanceMiles: null, postcode: trimmed }
  }
}
