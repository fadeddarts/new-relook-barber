import { brand } from "../data/shop.ts"
import { WAIT_DISCLAIMER, formatClock, formatDayLong } from "./time.ts"
import type { DurationMin } from "./bookingTypes.ts"

export function customerBookSms(input: {
  date: string
  startMinute: number
  durationMin: DurationMin
  cancelUrl: string
}) {
  return `${brand.wordmark}: you're booked ${formatDayLong(input.date)}, ${formatClock(input.startMinute)} (${input.durationMin} min). ${WAIT_DISCLAIMER} Please cancel at least 24 hours ahead if you can: ${input.cancelUrl}`
}

export function ownerBookSms(input: {
  name: string
  phone: string
  date: string
  startMinute: number
  durationMin: DurationMin
}) {
  return `${brand.wordmark} booking: ${input.name}, ${input.phone}, ${formatDayLong(input.date)} ${formatClock(input.startMinute)}, ${input.durationMin} min.`
}

export function customerCancelSms(input: { date: string; startMinute: number }) {
  return `${brand.wordmark}: your ${formatDayLong(input.date)}, ${formatClock(input.startMinute)} time is cancelled.`
}

export function ownerCancelSms(input: { name: string; date: string; startMinute: number }) {
  return `${brand.wordmark} cancelled: ${input.name}, ${formatDayLong(input.date)} ${formatClock(input.startMinute)}.`
}
