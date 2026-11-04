import { useEffect, useId, useState, type FormEvent } from "react"
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
import { MAX_CAPACITY, bookableDates, firstBookableDate, formatClock, formatDayLong } from "../lib/time"
import type { DayAvailability, DurationMin, OwnerDay, OwnerTileChair } from "../lib/bookingTypes"
import { DateStrip } from "./DateStrip"
import { Nav } from "./Nav"

const fieldClass =
  "mt-1.5 w-full border-b border-bone/25 bg-transparent py-2 font-sans text-base text-bone outline-none placeholder:text-bone/35 focus:border-gold"

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

  useEffect(() => {
    document.title = `Board — ${brand.name}`
    return () => {
      document.title = `${brand.name} — Eglinton West, Toronto`
    }
  }, [])

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
          clearOwnerSession()
          setAuthed(false)
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
  }, [authed, date, duration])

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
      setError(caught instanceof BookingError ? caught.message : "Could not change chairs.")
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
      setError(caught instanceof BookingError ? caught.message : "Could not mark that time.")
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
          <p className="type-label">Shop board</p>
          <h1 className="mt-2 font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
            PIN
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-bone/70">
            After you reply on WhatsApp, mark the chair here. That is what takes the time off the public booker.
          </p>
          <form className="mt-8" onSubmit={login}>
            <label className="block" htmlFor={`${baseId}-pin`}>
              <span className="type-label">PIN</span>
              <input
                id={`${baseId}-pin`}
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
              className="type-button mt-8 inline-flex h-11 w-full items-center justify-center bg-gold text-ink"
            >
              Open board
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-ink text-bone">
      <Nav standalone />
      <main className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-8">
        <div className="flex items-start justify-between gap-4">
          <p className="type-label">Shop board</p>
          <button
            type="button"
            className="type-button inline-flex min-h-11 shrink-0 items-center px-4 text-bone/55 transition-colors hover:text-bone"
            onClick={() => {
              clearOwnerSession()
              setAuthed(false)
              setDay(null)
            }}
          >
            Logout
          </button>
        </div>
        <h1 className="mt-2 font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
          Mark a time.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone/70">
          Same grid as the booker. A time leaves the public page only when every chair at that time is marked. Two
          chairs means two names before 11:00 disappears. Remove a name from the list on the right.
        </p>

        <div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            <p className="type-label">How long</p>
            <div className="mt-2 grid max-w-[20rem] grid-cols-2 gap-2">
              {([30, 60] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`h-10 w-full border font-display text-sm tracking-wide ${
                    duration === item ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                  }`}
                >
                  {item} min
                </button>
              ))}
            </div>

            <p className="type-label mt-6">Day</p>
            <div className="mt-2">
              <DateStrip wrap dates={dates} value={date} onChange={setDate} />
            </div>

            <p className="type-label mt-6">Open times</p>
            {!avail ? (
              <p className="mt-2 text-sm text-bone/65">Checking the board…</p>
            ) : slots.length === 0 ? (
              <p className="mt-2 text-sm text-bone/65">No {duration}-minute times left this day.</p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {slots.map((slot) => {
                  const selected = startMinute === slot.minute
                  return (
                    <button
                      key={slot.minute}
                      type="button"
                      onClick={() => setStartMinute(slot.minute)}
                      className={`flex h-12 flex-col items-center justify-center border px-1 font-sans leading-none ${
                        selected ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                      }`}
                    >
                      <span className="text-[13px]">{formatClock(slot.minute)}</span>
                      <span className={`mt-0.5 text-[10px] ${selected ? "text-ink/70" : "text-bone/50"}`}>
                        {slot.open} {slot.open === 1 ? "chair" : "chairs"} left
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid gap-5 md:sticky md:top-6">
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
            <div>
              <p className="type-label">Chairs working</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="type-button h-10 border border-bone/20"
                  disabled={!day || busy}
                  onClick={() => void changeCapacity(capacity - 1)}
                >
                  −
                </button>
                <p className="flex h-10 items-center justify-center border border-bone/20 font-display text-sm">
                  {capacity}
                </p>
                <button
                  type="button"
                  className="type-button h-10 border border-bone/20"
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
              className="type-button inline-flex h-11 w-full items-center justify-center bg-gold px-5 text-ink disabled:opacity-60"
            >
              {busy ? "Updating…" : "Mark this time"}
            </button>

            <div>
              <p className="type-label">On the board</p>
              <p className="mt-1 text-xs text-bone/50">{formatDayLong(date)}</p>
              {held.length === 0 ? (
                <p className="mt-3 text-sm text-bone/60">No names this day yet.</p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {held.map((row) => (
                    <li key={row.id} className="border border-bone/20 px-3 py-2">
                      <p className="text-sm leading-snug">
                        {formatClock(row.minute)} · {row.name} · {row.durationMin} min
                      </p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void drop(row.id)}
                        className="type-label mt-2 text-gold disabled:opacity-50"
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
