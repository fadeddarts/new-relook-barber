import { DEFAULT_CAPACITY, SLOT_MINUTES, hasStarted, hoursForDate } from "./time.ts"
import type { DurationMin, OccupancyRow } from "./bookingTypes.ts"

export function chairFree(
  occupancy: OccupancyRow[],
  date: string,
  chairIndex: number,
  startMinute: number,
  durationMin: DurationMin,
) {
  const tiles = durationMin === 60 ? [startMinute, startMinute + SLOT_MINUTES] : [startMinute]
  return tiles.every(
    (slotMinute) =>
      !occupancy.some(
        (row) => row.date === date && row.chairIndex === chairIndex && row.slotMinute === slotMinute,
      ),
  )
}

export function freeChairCount(
  occupancy: OccupancyRow[],
  date: string,
  capacity: number,
  startMinute: number,
  durationMin: DurationMin,
) {
  let open = 0
  for (let chairIndex = 0; chairIndex < capacity; chairIndex += 1) {
    if (chairFree(occupancy, date, chairIndex, startMinute, durationMin)) open += 1
  }
  return open
}

export function findFreeChair(
  occupancy: OccupancyRow[],
  date: string,
  capacity: number,
  startMinute: number,
  durationMin: DurationMin,
) {
  for (let chairIndex = 0; chairIndex < capacity; chairIndex += 1) {
    if (chairFree(occupancy, date, chairIndex, startMinute, durationMin)) return chairIndex
  }
  return null
}

export function startMinutesFor(date: string, durationMin: DurationMin) {
  const { openMinute, closeMinute } = hoursForDate(date)
  const last = closeMinute - durationMin
  const starts: number[] = []
  for (let minute = openMinute; minute <= last; minute += SLOT_MINUTES) starts.push(minute)
  return starts
}

export function availableStarts(
  occupancy: OccupancyRow[],
  date: string,
  capacity: number,
  durationMin: DurationMin,
  now = new Date(),
) {
  return startMinutesFor(date, durationMin).filter((minute) => {
    if (hasStarted(date, minute, now)) return false
    return findFreeChair(occupancy, date, capacity, minute, durationMin) !== null
  })
}

export function occupancyTiles(date: string) {
  return startMinutesFor(date, 30)
}

export function dayCapacity(days: Record<string, { capacity: number }>, date: string) {
  return days[date]?.capacity ?? DEFAULT_CAPACITY
}

export function assertDuration(value: number): DurationMin {
  if (value === 30 || value === 60) return value
  throw new Error("LENGTH")
}
