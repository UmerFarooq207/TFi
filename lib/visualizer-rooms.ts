export interface VisualizerRoom {
  id: string
  name: string
  file: string
}

export const VISUALIZER_ROOMS: VisualizerRoom[] = [
  { id: "living-room-1", name: "Living Room 1", file: "LivingRoom1.jpeg" },
  { id: "living-room-2", name: "Living Room 2", file: "LivingRoom2.jpeg" },
  { id: "kitchen-1", name: "Kitchen 1", file: "Kitchen1.jpeg" },
  { id: "kitchen-2", name: "Kitchen 2", file: "Kitchen2.jpeg" },
]

export const VISUALIZER_ROOMS_DIR = "VisualizerImages"

export function publicRoomUrl(room: VisualizerRoom): string {
  return `/${VISUALIZER_ROOMS_DIR}/${room.file}`
}

export function findRoom(id: string): VisualizerRoom | undefined {
  return VISUALIZER_ROOMS.find((r) => r.id === id)
}
