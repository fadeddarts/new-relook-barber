import { services } from "../data/services"
import type { DurationMin } from "./bookingTypes"

export function suggestedDuration(minutes: number | null): DurationMin {
  if (minutes !== null && minutes <= 30) return 30
  return 60
}

export function durationForServiceName(name: string | null | undefined): DurationMin {
  if (!name) return 60
  const match = services.find((item) => item.name === name)
  return suggestedDuration(match?.minutes ?? null)
}

export const durationGuide = [
  { length: "30 min", detail: "Beard trim (~20 min)" },
  { length: "60 min", detail: "Haircuts (~40–50 min) and haircut & beard (~70 min)" },
] as const
