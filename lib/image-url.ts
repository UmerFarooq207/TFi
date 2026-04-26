export function toStoredImageUrl(imageValue: string): string {
  if (!imageValue) return imageValue
  if (imageValue.startsWith("http://") || imageValue.startsWith("https://")) return imageValue
  if (imageValue.startsWith("/")) return imageValue
  return `/api/images/${imageValue}`
}

