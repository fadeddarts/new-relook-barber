import type { DayAvailability, DurationMin, OwnerDay } from "./bookingTypes"

const root = (import.meta.env.VITE_BOOKING_API_URL as string | undefined)?.replace(/\/$/, "") || "/api/booking"

const sessionKey = "nr-owner-session"

export function ownerSession() {
  return localStorage.getItem(sessionKey)
}

function saveSession(session: string) {
  localStorage.setItem(sessionKey, session)
}

export function clearOwnerSession() {
  localStorage.removeItem(sessionKey)
}

class BookingError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set("Content-Type", "application/json")
  const session = ownerSession()
  if (session) headers.set("X-Owner-Session", session)
  const response = await fetch(`${root}${path}`, { ...init, headers })
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) {
    throw new BookingError(data.error || "Something went wrong.", response.status)
  }
  return data as T
}

export function fetchDay(date: string) {
  return request<DayAvailability>(`/day?date=${encodeURIComponent(date)}`)
}

export async function ownerLogin(pin: string) {
  const result = await request<{ session: string }>("/owner/login", {
    method: "POST",
    body: JSON.stringify({ pin }),
  })
  saveSession(result.session)
  return result
}

export function fetchOwnerDay(date: string) {
  return request<OwnerDay>(`/owner/day?date=${encodeURIComponent(date)}`)
}

export function setOwnerCapacity(date: string, capacity: number) {
  return request<OwnerDay>("/owner/capacity", {
    method: "POST",
    body: JSON.stringify({ date, capacity }),
  })
}

export function ownerBlock(input: { date: string; startMinute: number; durationMin: DurationMin; name?: string }) {
  return request<OwnerDay>("/owner/block", { method: "POST", body: JSON.stringify(input) })
}

export function ownerRelease(input: { date: string; chairIndex: number; slotMinute: number }) {
  return request<OwnerDay>("/owner/release", { method: "POST", body: JSON.stringify(input) })
}

export function ownerDrop(appointmentId: string) {
  return request<OwnerDay>("/owner/drop", { method: "POST", body: JSON.stringify({ appointmentId }) })
}

export { BookingError }
