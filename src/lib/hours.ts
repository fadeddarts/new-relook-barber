import { week, type Weekday } from "../data/shop"
import { TZ } from "./time.ts"

const order: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? "p.m." : "a.m."
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${suffix}`
}

export function formatRange(open: number, close: number) {
  return `${formatHour(open)} – ${formatHour(close)}`
}

function parts(now: Date) {
  const list = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)

  const weekday = (list.find((part) => part.type === "weekday")?.value ?? "Mon") as Weekday
  const hour = Number(list.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(list.find((part) => part.type === "minute")?.value ?? "0")
  return { weekday, minutes: hour * 60 + minute }
}

export function shopStatus(now = new Date()) {
  const { weekday, minutes } = parts(now)
  const today = week.find((day) => day.short === weekday) ?? week[0]
  const todayIndex = order.indexOf(today.short)

  if (minutes >= today.open * 60 && minutes < today.close * 60) {
    const remaining = today.close * 60 - minutes
    if (remaining <= 60) {
      return {
        open: true,
        weekday,
        label: `Open · closes soon, ${formatHour(today.close)}`,
      }
    }
    return { open: true, weekday, label: `Open today · until ${formatHour(today.close)}` }
  }

  for (let step = 0; step < 7; step += 1) {
    const short = order[(todayIndex + step) % 7]
    const day = week.find((item) => item.short === short)
    if (!day) continue
    if (step === 0 && minutes >= day.open * 60) continue
    const when = step === 0 ? "today" : day.day
    return { open: false, weekday, label: `Closed · opens ${when} ${formatHour(day.open)}` }
  }

  return { open: false, weekday, label: "Closed" }
}
