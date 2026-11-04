import { week, type Weekday } from "../data/shop.ts"

export const TZ = "America/Toronto"
export const BOOKING_HORIZON_DAYS = 14
export const DEFAULT_CAPACITY = 2
export const MAX_CAPACITY = 4
export const SLOT_MINUTES = 30
export const WAIT_DISCLAIMER = "Times are a start window. You may wait up to 15 minutes."

const weekdayOrder: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function torontoDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function torontoMinutes(now = new Date()) {
  const list = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const hour = Number(list.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(list.find((part) => part.type === "minute")?.value ?? "0")
  return hour * 60 + minute
}

export function weekdayForDate(date: string): Weekday {
  const instant = Date.parse(`${date}T17:00:00.000Z`)
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(new Date(instant)) as Weekday
  return weekday
}

export function hoursForDate(date: string) {
  const short = weekdayForDate(date)
  const day = week.find((item) => item.short === short) ?? week[0]
  return { openMinute: day.open * 60, closeMinute: day.close * 60, weekday: short, label: day.day }
}

export function addDays(date: string, days: number) {
  const instant = Date.parse(`${date}T17:00:00.000Z`) + days * 86_400_000
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(instant))
}

export function diffDays(from: string, to: string) {
  const a = Date.parse(`${from}T17:00:00.000Z`)
  const b = Date.parse(`${to}T17:00:00.000Z`)
  return Math.round((b - a) / 86_400_000)
}

export function bookableDates(now = new Date()) {
  const today = torontoDateString(now)
  return Array.from({ length: BOOKING_HORIZON_DAYS }, (_, index) => addDays(today, index))
}

export function firstBookableDate(now = new Date()) {
  const dates = bookableDates(now)
  const today = dates[0]
  if (!today) return ""
  if (torontoMinutes(now) >= hoursForDate(today).closeMinute) return dates[1] ?? today
  return today
}

export function formatClock(minutes: number) {
  const hour = Math.floor(minutes / 60)
  const min = minutes % 60
  const suffix = hour >= 12 ? "p.m." : "a.m."
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${String(min).padStart(2, "0")} ${suffix}`
}

export function formatDayHeading(date: string) {
  const instant = Date.parse(`${date}T17:00:00.000Z`)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(instant))
}

export function formatDayLong(date: string) {
  const instant = Date.parse(`${date}T17:00:00.000Z`)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(instant))
}

export function isWithin24Hours(date: string, startMinute: number, now = new Date()) {
  const today = torontoDateString(now)
  const ahead = diffDays(today, date) * 1440 + startMinute - torontoMinutes(now)
  return ahead > 0 && ahead <= 24 * 60
}

export function hasStarted(date: string, startMinute: number, now = new Date()) {
  const today = torontoDateString(now)
  if (date < today) return true
  if (date > today) return false
  return startMinute <= torontoMinutes(now)
}

export function slotEnded(date: string, startMinute: number, durationMin: number, now = new Date()) {
  const today = torontoDateString(now)
  if (date < today) return true
  if (date > today) return false
  return startMinute + durationMin <= torontoMinutes(now)
}

export { weekdayOrder }
