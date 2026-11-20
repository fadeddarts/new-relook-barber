import { useCallback, useEffect, useId, useState, type FormEvent } from "react"
import { brand } from "../data"
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
import { boardGuideHref } from "../lib/route"
import { MAX_CAPACITY, bookableDates, firstBookableDate, formatClock, formatDayLong } from "../lib/time"
import type { DayAvailability, DurationMin, OwnerDay, OwnerTileChair } from "../lib/bookingTypes"
import { useIdleTimeout } from "../lib/useIdleTimeout"
import { DateStrip } from "./DateStrip"
import { Nav } from "./Nav"

const fieldClass =
  "mt-1.5 w-full border-b border-bone/25 bg-transparent py-2 font-sans text-base text-bone outline-none placeholder:text-bone/35 focus:border-gold"

const IDLE_MS = 30 * 60 * 1000

type Held = {
  id: string
  name: string
  minute: number
  durationMin: number
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
  const [duration, setDuration] = useState<DurationMin>(30)
  const [date, setDate] = useState(firstBookableDate)
  const [startMinute, setStartMinute] = useState<number | null>(null)
  const [name, setName] = useState("Walk-in")
  const [day, setDay] = useState<OwnerDay | null>(null)
  const [avail, setAvail] = useState<DayAvailability | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const signOut = useCallback((reason?: string) => {
    clearOwnerSession()
    setAuthed(false)
    setDay(null)
    setAvail(null)
    setError(reason ?? null)
  }, [])

  useIdleTimeout(authed, IDLE_MS, () => signOut("Signed out after 10 minutes idle."))

  useEffect(() => {
    document.title = authed ? `Board — ${brand.name}` : `Staff login — ${brand.name}`
    return () => {
      document.title = `${brand.name} — Eglinton West, Toronto`
    }
  }, [authed])

  useEffect(() => {
    if (!authed) return
    let cancelled = false
    setDay(null)
    setAvail(null)
    setStartMinute(null)
    async function load() {
      try {
        const [nextDay, nextAvail] = await Promise.all([fetchOwnerDay(date), fetchDay(date)])
        if (cancelled) return
        setDay(nextDay)
        setAvail(nextAvail)
        const slots = duration === 30 ? nextAvail.slots30 : nextAvail.slots60
        const open = slots.filter((slot) => slot.open > 0).map((slot) => slot.minute)
        setStartMinute((current) => (current !== null && open.includes(current) ? current : null))
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
  }, [authed, date, duration, signOut])

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

  async function changeCapacity(next: number) {
    if (next < 1 || next > MAX_CAPACITY) return
    setBusy(true)
    try {
      const updated = await setOwnerCapacity(date, next)
      setDay(updated)
      setAvail(await fetchDay(date))
      setError(null)
    } catch (caught) {
      setError(caught instanceof BookingError ? caught.message : "Could not change how many we take.")
    } finally {
      setBusy(false)
    }
  }

  async function mark() {
    if (name.trim().length < 2 || startMinute === null) {
      setError(
        name.trim().length < 2 ? "Please add the name you confirmed." : "Pick a time that’s still open.",
      )
      return
    }
    setBusy(true)
    try {
      setDay(await ownerBlock({ date, startMinute, durationMin: duration, name: name.trim() }))
      setAvail(await fetchDay(date))
      setStartMinute(null)
      setName("Walk-in")
      setError(null)
    } catch (caught) {
      setError(caught instanceof BookingError ? caught.message : "Could not add that appointment.")
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

  const slots = (duration === 30 ? avail?.slots30 : avail?.slots60)?.filter((slot) => slot.open > 0) ?? []
  const held = day ? heldBookings(day) : []
  const capacity = day?.capacity ?? avail?.capacity ?? 2

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
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="type-label">Appointments</p>
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
        <h1 className="mt-2 font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
          Add an appointment.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone/70">
          After you reply OK on WhatsApp, put the name on a time. That time stays on Book until every
          opening is filled. Idle 30 minutes and this screen signs out.
        </p>

        <div className="mt-6 grid items-start gap-8 md:landscape:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <p className="type-label">1 · How long</p>
            <div className="mt-2 grid max-w-[24rem] grid-cols-2 gap-2">
              {([30, 60] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`h-12 w-full border font-display text-sm tracking-wide ${
                    duration === item ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                  }`}
                >
                  {item} min
                </button>
              ))}
            </div>

            <p className="type-label mt-6">2 · Day</p>
            <div className="mt-2">
              <DateStrip wrap tall dates={dates} value={date} onChange={setDate} />
            </div>

            <p className="type-label mt-6">3 · Time</p>
            {!avail ? (
              <p className="mt-2 text-sm text-bone/65">Checking open times…</p>
            ) : slots.length === 0 ? (
              <p className="mt-2 text-sm text-bone/65">No {duration}-minute times left this day.</p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {slots.map((slot) => {
                  const selected = startMinute === slot.minute
                  return (
                    <button
                      key={slot.minute}
                      type="button"
                      onClick={() => setStartMinute(slot.minute)}
                      className={`flex min-h-14 flex-col items-center justify-center border px-1 font-sans leading-none ${
                        selected ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                      }`}
                    >
                      <span className="text-[15px]">{formatClock(slot.minute)}</span>
                      <span className={`mt-0.5 text-[10px] ${selected ? "text-ink/70" : "text-bone/50"}`}>
                        {slot.open} {slot.open === 1 ? "opening" : "openings"} left
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid gap-5 lg:sticky lg:top-6">
            <label className="block" htmlFor={`${baseId}-name`}>
              <span className="type-label">4 · Name</span>
              <input
                id={`${baseId}-name`}
                className={fieldClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Walk-in"
                autoComplete="off"
              />
            </label>
            <div>
              <p className="type-label">How many we can take</p>
              <p className="mt-1 text-xs text-bone/50">Barbers working this day. Default is 2.</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="type-button h-12 border border-bone/20"
                  disabled={!day || busy}
                  onClick={() => void changeCapacity(capacity - 1)}
                >
                  −
                </button>
                <p className="flex h-12 items-center justify-center border border-bone/20 font-display text-base">
                  {capacity}
                </p>
                <button
                  type="button"
                  className="type-button h-12 border border-bone/20"
                  disabled={!day || busy}
                  onClick={() => void changeCapacity(capacity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            {error ? <p className="text-sm text-gold">{error}</p> : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void mark()}
              className="type-button inline-flex h-12 w-full items-center justify-center bg-gold px-5 text-ink disabled:opacity-60"
            >
              {busy ? "Adding…" : "Add to board"}
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
                        {formatClock(row.minute)} · {row.name} · {row.durationMin} min
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
          </div>
        </div>
      </main>
    </div>
  )
}
