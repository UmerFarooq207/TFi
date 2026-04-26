"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          filter: "blur(14px) saturate(0.6)",
          scale: 0.984,
          y: 14,
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px) saturate(1)",
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: "top center", willChange: "opacity, transform, filter" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
