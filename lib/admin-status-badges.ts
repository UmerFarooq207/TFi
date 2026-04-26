/** Neutral order status styles for admin (brand palette only). */
export const ADMIN_ORDER_STATUS_BADGE: Record<string, string> = {
  pending:
    "border-[rgba(33,35,37,0.2)] bg-[rgba(33,35,37,0.05)] text-[#212325]",
  confirmed:
    "border-[rgba(33,35,37,0.24)] bg-[rgba(33,35,37,0.08)] text-[#212325]",
  processing:
    "border-[rgba(33,35,37,0.28)] bg-[rgba(33,35,37,0.1)] text-[#212325]",
  delivered:
    "border-[rgba(33,35,37,0.32)] bg-[rgba(33,35,37,0.07)] text-[#212325]",
  cancelled:
    "border-dashed border-[rgba(33,35,37,0.35)] bg-transparent text-[rgba(33,35,37,0.55)]",
}

/** Neutral inquiry status styles for admin (brand palette only). */
export const ADMIN_INQUIRY_STATUS_BADGE: Record<string, string> = {
  new:
    "border-[rgba(33,35,37,0.32)] bg-[rgba(33,35,37,0.1)] text-[#212325]",
  "in-progress":
    "border-[rgba(33,35,37,0.24)] bg-[rgba(33,35,37,0.06)] text-[#212325]",
  resolved:
    "border-[rgba(33,35,37,0.24)] bg-[rgba(33,35,37,0.04)] text-[#212325]",
  archived:
    "border-dashed border-[rgba(33,35,37,0.35)] bg-transparent text-[rgba(33,35,37,0.5)]",
}
