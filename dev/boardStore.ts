import { randomBytes, randomUUID } from "node:crypto"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { MAX_CAPACITY, bookableDates, hasStarted, hoursForDate, isWithin24Hours, slotEnded } from "../src/lib/time.ts"
import { availableStarts, dayCapacity, findFreeChair, freeChairCount, occupancyTiles, startMinutesFor } from "../src/lib/slots.ts"
import { displayPhone, normalizePhone } from "../src/lib/phone.ts"
import { normalizeEmail } from "../src/lib/email.ts"
import { customerBookSms, customerCancelSms, ownerBookSms, ownerCancelSms } from "../src/lib/smsCopy.ts"
import { customerBookEmail, customerCancelEmail, ownerBookEmail, ownerCancelEmail } from "../src/lib/emailCopy.ts"
import { bookingWhatsAppText, shopWhatsAppUrl } from "../src/lib/whatsapp.ts"
import { ownerInbox, sendEmail } from "./email.ts"
import { ownerSmsNumber, sendSms } from "./sms.ts"
import type {
  Appointment,
  BookResult,
  CancelResult,
  DayAvailability,
  DurationMin,
  OccupancyRow,
  OwnerDay,
  OwnerTileChair,
} from "../src/lib/bookingTypes.ts"

type StoreFile = {
  days: Record<string, { capacity: number }>
  appointments: Appointment[]
  occupancy: OccupancyRow[]
  sessions: { id: string; expiresAt: number }[]
}

const filePath = join(dirname(fileURLToPath(import.meta.url)), "..", ".data", "booking.json")
const ownerPin = process.env.OWNER_PIN || "4821"
const sessionMs = 1000 * 60 * 60 * 24 * 30

function empty(): StoreFile {
  return { days: {}, appointments: [], occupancy: [], sessions: [] }
}

function load(): StoreFile {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as StoreFile
    parsed.appointments = (parsed.appointments ?? []).map((item) => ({
      ...item,
      customerEmail: item.customerEmail ?? null,
    }))
    parsed.sessions = (parsed.sessions ?? []).filter((session) => session.expiresAt > Date.now())
    return parsed
  } catch {
    return empty()
  }
}

function save(store: StoreFile) {
  mkdirSync(dirname(filePath), { recursive: true })
  const tmp = `${filePath}.tmp`
  writeFileSync(tmp, JSON.stringify(store, null, 2))
  renameSync(tmp, filePath)
}

function token() {
  return randomBytes(24).toString("base64url")
}

function active(store: StoreFile) {
  return store.appointments.filter((item) => item.status === "booked")
}

function occupancyOf(store: StoreFile, date: string) {
  const live = new Set(active(store).map((item) => item.id))
  return store.occupancy.filter((row) => row.date === date && live.has(row.appointmentId))
}

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Object.assign(new Error("DATE"), { status: 400 })
  const horizon = bookableDates()
  if (date < horizon[0] || date > horizon[horizon.length - 1]) {
    throw Object.assign(new Error("HORIZON"), { status: 400, message: "That day is not open for booking." })
  }
}

function assertSlot(date: string, startMinute: number, durationMin: DurationMin, kind: "customer" | "owner" = "customer") {
  assertDate(date)
  if (startMinute % 30 !== 0) throw Object.assign(new Error("SLOT"), { status: 400 })
  const hours = hoursForDate(date)
  if (startMinute < hours.openMinute || startMinute + durationMin > hours.closeMinute) {
    throw Object.assign(new Error("HOURS"), { status: 400, message: "That time is outside shop hours." })
  }
  if (kind === "owner") {
    if (slotEnded(date, startMinute, durationMin)) {
      throw Object.assign(new Error("PAST"), { status: 400, message: "That time has already ended." })
    }
    return
  }
  if (hasStarted(date, startMinute)) {
    throw Object.assign(new Error("PAST"), { status: 400, message: "That time has already passed." })
  }
}

function cancelUrlFor(tokenValue: string, siteBase?: string) {
  const publicUrl = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "")
  const base = (publicUrl || siteBase || "http://localhost:5176").replace(/\/$/, "")
  return `${base}/cancel/${tokenValue}`
}

function takeChair(
  store: StoreFile,
  input: {
    date: string
    startMinute: number
    durationMin: DurationMin
    source: "web" | "walkin"
    name: string | null
    phone: string | null
    email: string | null
    withToken: boolean
  },
) {
  const cap = dayCapacity(store.days, input.date)
  const occ = occupancyOf(store, input.date)
  const chairIndex = findFreeChair(occ, input.date, cap, input.startMinute, input.durationMin)
  if (chairIndex === null) {
    throw Object.assign(new Error("UNAVAILABLE"), { status: 409, message: "That time was just taken." })
  }
  const id = randomUUID()
  const cancelToken = input.withToken ? token() : null
  const appointment: Appointment = {
    id,
    date: input.date,
    startMinute: input.startMinute,
    durationMin: input.durationMin,
    chairIndex,
    source: input.source,
    customerName: input.name,
    customerPhone: input.phone,
    customerEmail: input.email,
    cancelToken,
    status: "booked",
  }
  store.appointments.push(appointment)
  const tiles = input.durationMin === 60 ? [input.startMinute, input.startMinute + 30] : [input.startMinute]
  for (const slotMinute of tiles) {
    store.occupancy.push({ date: input.date, chairIndex, slotMinute, appointmentId: id })
  }
  return appointment
}

export function getDay(date: string): DayAvailability {
  assertDate(date)
  const store = load()
  const capacity = dayCapacity(store.days, date)
  const occ = occupancyOf(store, date)
  const hours = hoursForDate(date)
  const slots30 = startMinutesFor(date, 30)
    .filter((minute) => !hasStarted(date, minute))
    .map((minute) => ({ minute, open: freeChairCount(occ, date, capacity, minute, 30) }))
  const slots60 = startMinutesFor(date, 60)
    .filter((minute) => !hasStarted(date, minute))
    .map((minute) => ({ minute, open: freeChairCount(occ, date, capacity, minute, 60) }))
  return {
    date,
    capacity,
    openMinute: hours.openMinute,
    closeMinute: hours.closeMinute,
    starts30: availableStarts(occ, date, capacity, 30),
    starts60: availableStarts(occ, date, capacity, 60),
    slots30,
    slots60,
  }
}

export async function book(input: {
  date: string
  startMinute: number
  durationMin: DurationMin
  name: string
  phone: string
  email: string
  siteBase?: string
}): Promise<BookResult> {
  const name = input.name.trim()
  const phone = normalizePhone(input.phone)
  const email = normalizeEmail(input.email)
  if (name.length < 2) throw Object.assign(new Error("NAME"), { status: 400, message: "Please add your name." })
  if (!phone) throw Object.assign(new Error("PHONE"), { status: 400, message: "Please add a phone number." })
  if (!email) throw Object.assign(new Error("EMAIL"), { status: 400, message: "Please add an email for the confirmation." })
  assertSlot(input.date, input.startMinute, input.durationMin)

  const store = load()
  const upcoming = active(store).filter((item) => item.customerPhone === phone && !hasStarted(item.date, item.startMinute))
  if (upcoming.length >= 3) {
    throw Object.assign(new Error("LIMIT"), { status: 400, message: "This number already has three upcoming times. Cancel one first, or call the shop." })
  }

  const appointment = takeChair(store, {
    date: input.date,
    startMinute: input.startMinute,
    durationMin: input.durationMin,
    source: "web",
    name,
    phone,
    email,
    withToken: true,
  })
  save(store)

  const cancelUrl = cancelUrlFor(appointment.cancelToken!, input.siteBase)
  const shownPhone = displayPhone(phone)
  const customerMail = customerBookEmail({
    date: appointment.date,
    startMinute: appointment.startMinute,
    durationMin: appointment.durationMin,
    cancelUrl,
  })
  const ownerMail = ownerBookEmail({
    name,
    phone: shownPhone,
    email,
    date: appointment.date,
    startMinute: appointment.startMinute,
    durationMin: appointment.durationMin,
  })
  const inbox = ownerInbox()
  const [customerEmail, ownerEmail, customerSms, ownerSms] = await Promise.all([
    sendEmail({ to: email, subject: customerMail.subject, text: customerMail.text }),
    inbox ? sendEmail({ to: inbox, subject: ownerMail.subject, text: ownerMail.text }) : Promise.resolve(false),
    sendSms(
      phone,
      customerBookSms({
        date: appointment.date,
        startMinute: appointment.startMinute,
        durationMin: appointment.durationMin,
        cancelUrl,
      }),
    ),
    sendSms(
      ownerSmsNumber(),
      ownerBookSms({
        name,
        phone: shownPhone,
        date: appointment.date,
        startMinute: appointment.startMinute,
        durationMin: appointment.durationMin,
      }),
    ),
  ])
  return {
    id: appointment.id,
    date: appointment.date,
    startMinute: appointment.startMinute,
    durationMin: appointment.durationMin,
    name,
    phone: shownPhone,
    email,
    cancelToken: appointment.cancelToken!,
    cancelUrl,
    whatsappUrl: shopWhatsAppUrl(
      bookingWhatsAppText({
        name,
        date: appointment.date,
        startMinute: appointment.startMinute,
        durationMin: appointment.durationMin,
      }),
    ),
    emailSent: { customer: customerEmail, owner: ownerEmail },
    sms: { customer: customerSms, owner: ownerSms },
  }
}

function findByToken(store: StoreFile, cancelToken: string) {
  return active(store).find((item) => item.cancelToken === cancelToken) ?? null
}

function findByPhoneDate(store: StoreFile, phone: string, date: string) {
  return active(store).filter((item) => item.customerPhone === phone && item.date === date)
}

async function cancelAppointment(store: StoreFile, appointment: Appointment): Promise<CancelResult> {
  if (hasStarted(appointment.date, appointment.startMinute)) {
    throw Object.assign(new Error("STARTED"), { status: 400, message: "That time has already started. Call the shop." })
  }
  appointment.status = "cancelled"
  store.occupancy = store.occupancy.filter((row) => row.appointmentId !== appointment.id)
  const within24h = isWithin24Hours(appointment.date, appointment.startMinute)
  save(store)
  const name = appointment.customerName || "Walk-in"
  const customerMail = customerCancelEmail({ date: appointment.date, startMinute: appointment.startMinute })
  const ownerMail = ownerCancelEmail({ name, date: appointment.date, startMinute: appointment.startMinute })
  const inbox = ownerInbox()
  const [customerEmail, ownerEmail, customerSms, ownerSms] = await Promise.all([
    appointment.customerEmail
      ? sendEmail({ to: appointment.customerEmail, subject: customerMail.subject, text: customerMail.text })
      : Promise.resolve(false),
    inbox ? sendEmail({ to: inbox, subject: ownerMail.subject, text: ownerMail.text }) : Promise.resolve(false),
    appointment.customerPhone
      ? sendSms(appointment.customerPhone, customerCancelSms({ date: appointment.date, startMinute: appointment.startMinute }))
      : Promise.resolve(false),
    sendSms(ownerSmsNumber(), ownerCancelSms({ name, date: appointment.date, startMinute: appointment.startMinute })),
  ])
  return {
    ok: true,
    date: appointment.date,
    startMinute: appointment.startMinute,
    durationMin: appointment.durationMin,
    within24h,
    emailSent: { customer: customerEmail, owner: ownerEmail },
    sms: { customer: customerSms, owner: ownerSms },
  }
}

export async function cancel(input: { token?: string; phone?: string; date?: string }): Promise<CancelResult> {
  const store = load()
  if (input.token) {
    const appointment = findByToken(store, input.token)
    if (!appointment) throw Object.assign(new Error("MISSING"), { status: 404, message: "No booking for that cancel link." })
    return cancelAppointment(store, appointment)
  }
  const phone = input.phone ? normalizePhone(input.phone) : null
  if (!phone || !input.date) {
    throw Object.assign(new Error("LOOKUP"), { status: 400, message: "Add the phone number and day you booked." })
  }
  const matches = findByPhoneDate(store, phone, input.date)
  if (matches.length === 0) throw Object.assign(new Error("MISSING"), { status: 404, message: "No booking for that phone on that day." })
  if (matches.length > 1) {
    throw Object.assign(new Error("AMBIGUOUS"), {
      status: 400,
      message: "That number has more than one time that day. Use the cancel link from your email.",
    })
  }
  return cancelAppointment(store, matches[0])
}

export function lookup(input: { token?: string; phone?: string; date?: string }) {
  const store = load()
  if (input.token) {
    const appointment = findByToken(store, input.token)
    if (!appointment) return null
    return {
      date: appointment.date,
      startMinute: appointment.startMinute,
      durationMin: appointment.durationMin,
      within24h: isWithin24Hours(appointment.date, appointment.startMinute),
      started: hasStarted(appointment.date, appointment.startMinute),
    }
  }
  const phone = input.phone ? normalizePhone(input.phone) : null
  if (!phone || !input.date) return null
  const matches = findByPhoneDate(store, phone, input.date)
  if (matches.length !== 1) return null
  const appointment = matches[0]
  return {
    date: appointment.date,
    startMinute: appointment.startMinute,
    durationMin: appointment.durationMin,
    within24h: isWithin24Hours(appointment.date, appointment.startMinute),
    started: hasStarted(appointment.date, appointment.startMinute),
  }
}

function requireSession(store: StoreFile, sessionId: string | undefined) {
  const session = store.sessions.find((item) => item.id === sessionId && item.expiresAt > Date.now())
  if (!session) throw Object.assign(new Error("AUTH"), { status: 401, message: "Sign in again." })
}

export function ownerLogin(pin: string) {
  if (pin.trim() !== ownerPin) throw Object.assign(new Error("PIN"), { status: 401, message: "Wrong PIN." })
  const store = load()
  const id = randomUUID()
  store.sessions.push({ id, expiresAt: Date.now() + sessionMs })
  save(store)
  return { session: id }
}

export function ownerDay(sessionId: string | undefined, date: string): OwnerDay {
  assertDate(date)
  const store = load()
  requireSession(store, sessionId)
  const capacity = dayCapacity(store.days, date)
  const hours = hoursForDate(date)
  const occ = occupancyOf(store, date)
  const byId = new Map(active(store).map((item) => [item.id, item]))
  const tiles = occupancyTiles(date).map((minute) => {
    const chairs: OwnerTileChair[] = Array.from({ length: capacity }, (_, chairIndex) => {
      const row = occ.find((item) => item.chairIndex === chairIndex && item.slotMinute === minute)
      if (!row) return { taken: false }
      const appointment = byId.get(row.appointmentId)
      if (!appointment) return { taken: false }
      return {
        taken: true,
        appointmentId: appointment.id,
        name: appointment.customerName || "Walk-in",
        phone: appointment.customerPhone,
        email: appointment.customerEmail ?? null,
        source: appointment.source,
        startMinute: appointment.startMinute,
        durationMin: appointment.durationMin,
        continuation: appointment.startMinute !== minute,
      }
    })
    return { minute, chairs }
  })
  return { date, capacity, openMinute: hours.openMinute, closeMinute: hours.closeMinute, tiles }
}

export function setCapacity(sessionId: string | undefined, date: string, capacity: number) {
  assertDate(date)
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_CAPACITY) {
    throw Object.assign(new Error("CAPACITY"), { status: 400, message: `Chairs must be 1–${MAX_CAPACITY}.` })
  }
  const store = load()
  requireSession(store, sessionId)
  const occ = occupancyOf(store, date)
  const maxChair = occ.reduce((max, row) => Math.max(max, row.chairIndex), -1)
  const minAllowed = maxChair + 1
  if (capacity < minAllowed) {
    throw Object.assign(new Error("CAPACITY"), {
      status: 400,
      message: `Can't drop below ${minAllowed} while those chairs still have times taken. Free a chair first.`,
    })
  }
  store.days[date] = { capacity }
  save(store)
  return ownerDay(sessionId, date)
}

export function blockSlot(
  sessionId: string | undefined,
  input: { date: string; startMinute: number; durationMin: DurationMin; name?: string },
) {
  assertSlot(input.date, input.startMinute, input.durationMin, "owner")
  const store = load()
  requireSession(store, sessionId)
  takeChair(store, {
    date: input.date,
    startMinute: input.startMinute,
    durationMin: input.durationMin,
    source: "walkin",
    name: input.name?.trim() || "Walk-in",
    phone: null,
    email: null,
    withToken: false,
  })
  save(store)
  return ownerDay(sessionId, input.date)
}

export function releaseTile(sessionId: string | undefined, input: { date: string; chairIndex: number; slotMinute: number }) {
  const store = load()
  requireSession(store, sessionId)
  const row = store.occupancy.find(
    (item) => item.date === input.date && item.chairIndex === input.chairIndex && item.slotMinute === input.slotMinute,
  )
  if (!row) throw Object.assign(new Error("MISSING"), { status: 404, message: "That chair is already free." })
  const appointment = store.appointments.find((item) => item.id === row.appointmentId)
  store.occupancy = store.occupancy.filter((item) => item !== row)
  if (appointment && appointment.status === "booked") {
    const left = store.occupancy.filter((item) => item.appointmentId === appointment.id)
    if (left.length === 0) {
      appointment.status = "cancelled"
    } else {
      const start = Math.min(...left.map((item) => item.slotMinute))
      appointment.startMinute = start
      appointment.durationMin = (left.length * 30) as DurationMin
    }
  }
  save(store)
  return ownerDay(sessionId, input.date)
}

export function dropAppointment(sessionId: string | undefined, appointmentId: string) {
  const store = load()
  requireSession(store, sessionId)
  const appointment = store.appointments.find((item) => item.id === appointmentId && item.status === "booked")
  if (!appointment) {
    throw Object.assign(new Error("MISSING"), { status: 404, message: "That name is already off the board." })
  }
  appointment.status = "cancelled"
  store.occupancy = store.occupancy.filter((item) => item.appointmentId !== appointment.id)
  save(store)
  return ownerDay(sessionId, appointment.date)
}
