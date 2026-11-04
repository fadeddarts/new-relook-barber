import { brand, notifyWhatsappDigits } from "../data/shop.ts"
import { formatClock, formatDayLong } from "./time.ts"

export function shopWhatsAppUrl(text: string) {
  return `https://wa.me/${notifyWhatsappDigits}?text=${encodeURIComponent(text)}`
}

export function bookingWhatsAppText(input: {
  name: string
  date: string
  startMinute: number
  durationMin: 30 | 60
}) {
  return [
    `Hello ${brand.name} — I want to book a chair.`,
    `Name: ${input.name}`,
    `When: ${formatDayLong(input.date)} · ${formatClock(input.startMinute)}`,
    `Length: ${input.durationMin} min`,
    "Please reply if that time works.",
  ].join("\n")
}

export function cancelWhatsAppText(input: { name: string; date: string; startMinute: number }) {
  return [
    `Hello ${brand.name} — I need to cancel.`,
    `Name: ${input.name}`,
    `When: ${formatDayLong(input.date)} · ${formatClock(input.startMinute)}`,
  ].join("\n")
}
