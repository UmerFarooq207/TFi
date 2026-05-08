"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect } from "react"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
    }
  }, [pathname, reduce])

  if (reduce) {
    return <div key={pathname}>{children}</div>
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 110, scale: 1, filter: "blur(8px)" }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 },
        }}
        exit={{
          opacity: 0,
          y: -24,
          scale: 0.965,
          filter: "blur(6px)",
          transition: { duration: 0.42, ease: [0.4, 0, 0.6, 1] },
        }}
        style={{ position: "relative", transformOrigin: "center top", willChange: "opacity, transform, filter" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
