import { services } from "../data/services"
import type { DurationMin } from "./bookingTypes"

export function suggestedDuration(minutes: number): DurationMin {
  if (minutes <= 30) return 30
  return 60
}

export function durationForServiceName(name: string | null | undefined): DurationMin {
  if (!name) return 60
  const match = services.find((item) => item.name === name)
  return suggestedDuration(match?.minutes ?? 60)
}

export const durationGuide = [
  { length: "30 min", detail: "Beard trim, neck trim, hot towel, wash, waxing" },
  { length: "60 min", detail: "Haircut, and haircut & beard" },
] as const
