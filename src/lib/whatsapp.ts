import { notifyWhatsappDigits } from "../data/shop.ts"
import { formatClock, formatDayLong } from "./time.ts"

export function shopWhatsAppUrl(text: string) {
  return `https://wa.me/${notifyWhatsappDigits}?text=${encodeURIComponent(text)}`
}

export function bookingWhatsAppText(input: {
  name: string
  date: string
  startMinute: number
  durationMin: 30 | 60
  services?: { name: string; price: number; time?: string | null }[]
}) {
  const picked = input.services ?? []
  return [
    "I want to book an appointment.",
    "",
    `Name: ${input.name}`,
    ...picked.map((item) => `Service: ${item.name}`),
    `${formatDayLong(input.date)} · ${formatClock(input.startMinute)}`,
  ].join("\n")
}

export function cancelWhatsAppText(input: { name: string; date: string; startMinute: number }) {
  return [
    "I need to cancel.",
    `Name: ${input.name}`,
    `When: ${formatDayLong(input.date)} · ${formatClock(input.startMinute)}`,
  ].join("\n")
}
