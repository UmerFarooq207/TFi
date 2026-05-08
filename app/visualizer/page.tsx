import type { Metadata } from "next"
import { Visualizer } from "./visualizer"

export const metadata: Metadata = {
  title: "Room Visualizer",
  description: "Try TFi flooring and wall paneling in a virtual room before you buy.",
}

export default function VisualizerPage() {
  return <Visualizer />
}
