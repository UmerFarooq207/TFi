"use client"

import { motion } from "framer-motion"

const directionOffsets = {
  up:    { y: 36, x: 0 },
  down:  { y: -36, x: 0 },
  left:  { x: 36, y: 0 },
  right: { x: -36, y: 0 },
  none:  { y: 0,  x: 0 },
}

export function FadeIn({
  children,
  delay = 0,
  className,
  direction = "up",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: keyof typeof directionOffsets
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: "blur(6px)",
        ...directionOffsets[direction],
      }}
      whileInView={{
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        x: 0,
      }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
