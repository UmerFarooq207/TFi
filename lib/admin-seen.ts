// Per-browser "last seen" timestamps for admin notification badges.
// Stored in localStorage and broadcast to same-tab listeners via a custom event.

export const SEEN_KEY_ORDERS = "tfi-admin-lastSeen-orders"
export const SEEN_KEY_INQUIRIES = "tfi-admin-lastSeen-inquiries"
export const SEEN_EVENT = "tfi-admin-seen"

export function getLastSeen(key: string): number {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    // First-ever read: baseline at "now" so pre-existing items aren't shown as new.
    const now = Date.now()
    window.localStorage.setItem(key, String(now))
    return now
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function markSeen(key: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, String(Date.now()))
  window.dispatchEvent(new Event(SEEN_EVENT))
}
