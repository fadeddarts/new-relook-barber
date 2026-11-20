import { useCallback, useEffect, useId, useState, type FormEvent } from "react"
import { MAX_BOOKING_SERVICES, brand, findServices } from "../data"
import {
  BookingError,
  clearOwnerSession,
  fetchDay,
  fetchOwnerDay,
  ownerBlock,
  ownerDrop,
  ownerLogin,
  ownerSession,
  setOwnerCapacity,
} from "../lib/bookingClient"
import { durationForServices } from "../lib/estimates"
import { boardGuideHref } from "../lib/route"
import {
  DEFAULT_CAPACITY,
  MAX_CAPACITY,
  bookableDates,
  firstBookableDate,
  formatClock,
  formatDayLong,
} from "../lib/time"
import type { DayAvailability, OwnerDay, OwnerTileChair } from "../lib/bookingTypes"
import { useIdleTimeout } from "../lib/useIdleTimeout"
import { Nav } from "./Nav"
import { ServicePickers, ServiceTimeNotes, selectClass } from "./ServicePickers"

const fieldClass =
  "mt-1.5 w-full border-b border-bone/25 bg-transparent py-2 font-sans text-base text-bone outline-none placeholder:text-bone/35 focus:border-gold"

const IDLE_MS = 30 * 60 * 1000

type Held = {
  id: string
  name: string
  minute: number
  durationMin: number
  services: string[]
}

function heldBookings(day: OwnerDay): Held[] {
  const rows: Held[] = []
  for (const tile of day.tiles) {
    for (const chair of tile.chairs) {
      if (!isTaken(chair) || chair.continuation) continue
      rows.push({
        id: chair.appointmentId,
        name: chair.name,
        minute: chair.startMinute,
        durationMin: chair.durationMin,
        services: chair.services ?? [],
      })
    }
  }
  return rows.sort((a, b) => a.minute - b.minute || a.name.localeCompare(b.name))
}

function isTaken(chair: OwnerTileChair): chair is Extract<OwnerTileChair, { taken: true }> {
  return chair.taken
}

export function OwnerBoard() {
  const baseId = useId()
  const dates = bookableDates()
  const [authed, setAuthed] = useState(() => Boolean(ownerSession()))
  const [pin, setPin] = useState("")
  const [serviceNames, setServiceNames] = useState([""])
  const [date, setDate] = useState(firstBookableDate)
  const [startMinute, setStartMinute] = useState<number | null>(null)
  const [name, setName] = useState("Walk-in")
  const [barbers, setBarbers] = useState<number | null>(null)
  const [day, setDay] = useState<OwnerDay | null>(null)
  const [avail, setAvail] = useState<DayAvailability | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const picked = findServices(serviceNames)
  const duration = durationForServices(picked.map((item) => item.name))
  const savedBarbers = day?.defaultCapacity ?? DEFAULT_CAPACITY
  const shownBarbers = barbers ?? savedBarbers
  const barbersDirty = barbers !== null && barbers !== savedBarbers
  const bookingReady = name.trim().length >= 2 && picked.length > 0 && startMinute !== null

  const signOut = useCallback((reason?: string) => {
    clearOwnerSession()
    setAuthed(false)
    setDay(null)
    setAvail(null)
    setError(reason ?? null)
  }, [])

  useIdleTimeout(authed, IDLE_MS, () => signOut("Signed out after 30 minutes idle."))

  useEffect(() => {
    document.title = authed ? `Board — ${brand.name}` : `Staff login — ${brand.name}`
    return () => {
      document.title = `${brand.name} — Eglinton West, Toronto`
    }
  }, [authed])

  useEffect(() => {
    if (!authed) return
    let cancelled = false
    async function load() {
      try {
        const [nextDay, nextAvail] = await Promise.all([fetchOwnerDay(date), fetchDay(date)])
        if (cancelled) return
        setDay(nextDay)
        setAvail(nextAvail)
        setError(null)
      } catch (caught) {
        if (cancelled) return
        if (caught instanceof BookingError && caught.status === 401) {
          signOut()
          return
        }
        setError(caught instanceof BookingError ? caught.message : "Could not load the board.")
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 2000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [authed, date, signOut])

  useEffect(() => {
    if (!avail || picked.length === 0) {
      setStartMinute(null)
      return
    }
    const slots = (duration === 30 ? avail.slots30 : avail.slots60).filter((slot) => slot.open > 0)
    setStartMinute((current) => (current !== null && slots.some((slot) => slot.minute === current) ? current : null))
  }, [avail, duration, picked.length])

  async function login(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await ownerLogin(pin)
      setAuthed(true)
      setPin("")
    } catch (caught) {
      setError(caught instanceof BookingError ? caught.message : "Could not sign in.")
    } finally {
      setBusy(false)
    }
  }

  function setServiceAt(index: number, value: string) {
    const next = serviceNames.slice()
    next[index] = value
    setServiceNames(next)
    setStartMinute(null)
  }

  function addService() {
    if (serviceNames.length >= MAX_BOOKING_SERVICES || serviceNames.some((item) => !item)) return
    setServiceNames([...serviceNames, ""])
    setStartMinute(null)
  }

  function removeService(index: number) {
    const next = serviceNames.filter((_, other) => other !== index)
    setServiceNames(next.length ? next : [""])
    setStartMinute(null)
  }

  async function save() {
    if (!bookingReady && !barbersDirty) {
      setError(
        picked.length === 0
          ? "Pick a service and a time to add a booking, or change how many barbers and Save."
          : startMinute === null
            ? "Pick a time that’s still open, or change how many barbers and Save."
            : name.trim().length < 2
              ? "Please add the name you confirmed."
              : "Nothing to save.",
      )
      return
    }
    setBusy(true)
    try {
      let nextDay = day
      if (barbersDirty) {
        nextDay = await setOwnerCapacity(date, shownBarbers)
        setDay(nextDay)
        setBarbers(null)
      }
      if (bookingReady && startMinute !== null) {
        nextDay = await ownerBlock({
          date,
          startMinute,
          durationMin: duration,
          name: name.trim(),
          services: picked.map((item) => item.name),
        })
        setDay(nextDay)
        setStartMinute(null)
        setServiceNames([""])
        setName("Walk-in")
      }
      setAvail(await fetchDay(date))
      setError(null)
    } catch (caught) {
      setError(caught instanceof BookingError ? caught.message : "Could not save.")
    } finally {
      setBusy(false)
    }
  }

  async function drop(id: string) {
    setBusy(true)
    try {
      setDay(await ownerDrop(id))
      setAvail(await fetchDay(date))
      setError(null)
    } catch (caught) {
      setError(caught instanceof BookingError ? caught.message : "Could not remove that name.")
    } finally {
      setBusy(false)
    }
  }

  const slots =
    picked.length === 0
      ? []
      : ((duration === 30 ? avail?.slots30 : avail?.slots60)?.filter((slot) => slot.open > 0) ?? [])
  const onThisDay = day?.date === date
  const held = onThisDay ? heldBookings(day) : []
  const thisDayHeldHigher = Boolean(onThisDay && day.capacity > shownBarbers)

  if (!authed) {
    return (
      <div className="min-h-svh bg-ink text-bone">
        <Nav standalone />
        <main className="mx-auto max-w-sm px-5 py-12">
          <p className="type-label">Staff</p>
          <h1 className="mt-2 font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
            Staff login
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-bone/70">Enter the PIN.</p>
          <p className="mt-3">
            <a href={boardGuideHref()} className="type-label text-gold">
              How to use the board
            </a>
          </p>
          <form className="mt-8" onSubmit={login}>
            <label className="block" htmlFor={`${baseId}-pin`}>
              <span className="type-label">PIN</span>
              <input
                id={`${baseId}-pin`}
                type="password"
                className={fieldClass}
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
              />
            </label>
            {error ? <p className="mt-4 text-sm text-gold">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="type-button mt-8 inline-flex h-12 w-full items-center justify-center bg-gold text-ink"
            >
              Log in
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-ink text-bone">
      <Nav standalone />
      <main className="mx-auto max-w-xl px-5 py-6 md:px-8 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="type-label">Appointment</p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={boardGuideHref()}
              className="type-label inline-flex min-h-11 items-center px-3 text-bone/55 hover:text-bone"
            >
              How to use
            </a>
            <button
              type="button"
              className="type-button inline-flex min-h-11 shrink-0 items-center px-4 text-bone/55 transition-colors hover:text-bone"
              onClick={() => signOut()}
            >
              Logout
            </button>
          </div>
        </div>
        <h1 className="mt-2 font-display text-[1.85rem] leading-[0.95] font-bold tracking-[-0.04em] uppercase md:text-[2.5rem]">
          Add a time.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-bone/70">
          After you reply OK on WhatsApp, pick the same service and time they sent, put the name, then Save.
          Idle 30 minutes and this screen signs out.
        </p>

        <form className="mt-8 grid gap-6" onSubmit={(event) => event.preventDefault()}>
          <label className="block" htmlFor={`${baseId}-name`}>
            <span className="type-label">Name</span>
            <input
              id={`${baseId}-name`}
              className={fieldClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Walk-in"
              autoComplete="off"
            />
          </label>

          <ServicePickers
            idPrefix={baseId}
            values={serviceNames}
            onChangeAt={setServiceAt}
            onAdd={addService}
            onRemove={removeService}
          />
          <ServiceTimeNotes picked={picked} />

          <label className="block" htmlFor={`${baseId}-day`}>
            <span className="type-label">Day</span>
            <select
              id={`${baseId}-day`}
              className={selectClass}
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setStartMinute(null)
              }}
            >
              {dates.map((item) => (
                <option key={item} value={item}>
                  {formatDayLong(item)}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="type-label">Open times</p>
            {picked.length === 0 ? (
              <p className="mt-2 text-sm text-bone/65">Pick a service to see open times.</p>
            ) : !avail ? (
              <p className="mt-2 text-sm text-bone/65">Checking the board…</p>
            ) : slots.length === 0 ? (
              <p className="mt-2 text-sm text-bone/65">No open times left this day. Try another day.</p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2">
                {slots.map((slot) => {
                  const selected = startMinute === slot.minute
                  return (
                    <button
                      key={slot.minute}
                      type="button"
                      onClick={() => setStartMinute(slot.minute)}
                      className={`flex min-h-12 w-full items-center justify-center border px-3 font-sans text-[15px] leading-none ${
                        selected ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                      }`}
                    >
                      {formatClock(slot.minute)}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <p className="type-label">How many barbers</p>
            <p className="mt-1 text-xs text-bone/50">
              Shop default from now on. Save to keep it. Default starts at 2.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                className="type-button h-12 border border-bone/20"
                disabled={!day || busy || shownBarbers <= 1}
                onClick={() => setBarbers(Math.max(1, shownBarbers - 1))}
              >
                −
              </button>
              <p className="flex h-12 items-center justify-center border border-bone/20 font-display text-base">
                {shownBarbers}
              </p>
              <button
                type="button"
                className="type-button h-12 border border-bone/20"
                disabled={!day || busy || shownBarbers >= MAX_CAPACITY}
                onClick={() => setBarbers(Math.min(MAX_CAPACITY, shownBarbers + 1))}
              >
                +
              </button>
            </div>
            {thisDayHeldHigher ? (
              <p className="mt-2 text-sm text-bone/65">
                This day still needs {day?.capacity} while names are already on the board. Other days will use{" "}
                {shownBarbers}.
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-gold">{error}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="type-button inline-flex h-12 w-full items-center justify-center bg-gold px-5 text-ink disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>

          <div>
            <p className="type-label">Today’s appointments</p>
            <p className="mt-1 text-xs text-bone/50">{formatDayLong(date)}</p>
            {held.length === 0 ? (
              <p className="mt-3 text-sm text-bone/60">None yet this day.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {held.map((row) => (
                  <li key={row.id} className="border border-bone/20 px-3 py-3">
                    <p className="text-sm leading-snug">
                      {formatClock(row.minute)} · {row.name}
                      {row.services.length > 0 ? ` · ${row.services.join(", ")}` : ` · ${row.durationMin} min`}
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void drop(row.id)}
                      className="type-label mt-2 min-h-10 text-gold disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
