import { services } from "../data/services"
import type { DurationMin } from "./bookingTypes"

export function suggestedDuration(minutes: number): DurationMin {
  if (minutes <= 30) return 30
  return 60
}

export function durationForServiceName(name: string | null | undefined): DurationMin {
  return durationForServices(name ? [name] : [])
}

export function durationForServices(names: string[]): DurationMin {
  const minutes = names.reduce((sum, name) => {
    const match = services.find((item) => item.name === name)
    return sum + (match?.minutes ?? 0)
  }, 0)
  if (minutes <= 0) return 30
  return suggestedDuration(minutes)
}

export const durationGuide = [
  { length: "30 min", detail: "Haircut, beard trim, neck trim, wash, waxing" },
  { length: "60 min", detail: "Haircut & beard" },
] as const
