import type { Metadata } from "next"
import { Visualizer } from "./visualizer"

export const metadata: Metadata = {
  title: { absolute: "Preview Flooring in Your Room | Free AI Room Visualizer UK | TFi" },
  description:
    "Use the free TFi Floors and Interiors AI room visualizer to preview premium engineered oak flooring in your own room before you buy. Try different finishes, tones and collections — instant previews, UK-wide delivery.",
  keywords: [
    "preview flooring in your room",
    "free flooring visualizer UK",
    "AI room visualizer flooring",
    "engineered oak room preview",
    "virtual flooring designer UK",
    "TFi room visualizer",
    "see flooring in a room online",
    "interior material visualizer UK",
  ],
  alternates: { canonical: "/visualizer" },
  openGraph: {
    title: "Preview Flooring in Your Room | Free AI Room Visualizer UK | TFi",
    description:
      "Try premium engineered oak floors in your own room with the free TFi AI visualizer — instant previews, UK delivery.",
    url: "/visualizer",
    type: "website",
  },
}

export default function VisualizerPage() {
  return <Visualizer />
}
