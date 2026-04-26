import type { Metadata } from "next"
import { Visualizer } from "./visualizer"

export const metadata: Metadata = {
  title: "Room Visualizer",
  description: "Try TFi flooring and wall paneling in a virtual room before you buy.",
}

export default function VisualizerPage() {
  return (
    <div
      className="min-h-screen pt-28 pb-24"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 20% 55%, oklch(0.18 0.018 60 / 0.6), transparent 60%), oklch(0.09 0.006 55)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-10 lg:mb-14 max-w-2xl">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">
            Phase 5b · Room Visualizer
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-medium text-foreground leading-[0.98] tracking-tight">
            Picture it
            <span className="block italic text-foreground/30">in your space</span>
          </h1>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            Choose a zone, then tap any swatch to preview real TFi flooring and wall
            materials in a stylised interior. Mix textures, swap colours, and find the
            combination that fits your story.
          </p>
        </div>
        <Visualizer />
      </div>
    </div>
  )
}
