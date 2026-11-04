import { brand } from "../data/shop.ts"
import { customerBookSms, customerCancelSms } from "./smsCopy.ts"
import { formatClock, formatDayLong } from "./time.ts"
import type { DurationMin } from "./bookingTypes.ts"

export function customerBookEmail(input: {
  date: string
  startMinute: number
  durationMin: DurationMin
  cancelUrl: string
}) {
  return {
    subject: `${brand.wordmark}: you're booked ${formatDayLong(input.date)}, ${formatClock(input.startMinute)}`,
    text: [
      customerBookSms(input),
      "",
      "This time is already on the shop board. You do not need to send WhatsApp for it to count.",
      "If you need to drop it, use the cancel link above or call the shop.",
    ].join("\n"),
  }
}

export function customerCancelEmail(input: { date: string; startMinute: number }) {
  return {
    subject: `${brand.wordmark}: ${formatClock(input.startMinute)} ${formatDayLong(input.date)} is cancelled`,
    text: customerCancelSms(input),
  }
}

export function ownerBookEmail(input: {
  name: string
  phone: string
  email: string
  date: string
  startMinute: number
  durationMin: DurationMin
}) {
  return {
    subject: `${brand.wordmark} board: ${input.name} booked ${formatClock(input.startMinute)} ${formatDayLong(input.date)}`,
    text: [
      `${input.name} booked a chair on the website. It is on /board now.`,
      `When: ${formatDayLong(input.date)} · ${formatClock(input.startMinute)} · ${input.durationMin} min`,
      `Phone: ${input.phone}`,
      `Email: ${input.email}`,
      "WhatsApp is optional. If they never send it, this booking still stands.",
    ].join("\n"),
  }
}

export function ownerCancelEmail(input: { name: string; date: string; startMinute: number }) {
  return {
    subject: `${brand.wordmark} board: ${input.name} cancelled ${formatClock(input.startMinute)} ${formatDayLong(input.date)}`,
    text: `${input.name} cancelled ${formatDayLong(input.date)} ${formatClock(input.startMinute)}. That chair is open again on /board.`,
  }
}
