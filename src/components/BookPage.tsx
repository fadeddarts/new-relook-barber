import { useEffect, useId, useState, type ReactNode } from "react"
import { addressLine, brand, notifyPhoneDisplay, phoneDisplay, phoneHref } from "../data"
import { BookingError, fetchDay } from "../lib/bookingClient"
import { durationForServiceName, durationGuide } from "../lib/estimates"
import { cancelHref } from "../lib/route"
import { WAIT_DISCLAIMER, bookableDates, firstBookableDate, formatClock } from "../lib/time"
import type { DurationMin, SlotOpen } from "../lib/bookingTypes"
import { bookingWhatsAppText, shopWhatsAppUrl } from "../lib/whatsapp"
import { DateStrip } from "./DateStrip"
import { Nav } from "./Nav"

const fieldClass =
  "mt-1.5 w-full border-b border-bone/25 bg-transparent py-2 font-sans text-base text-bone outline-none focus:border-gold"

function presetService() {
  return new URLSearchParams(window.location.search).get("service")
}

export function BookPage() {
  const baseId = useId()
  const dates = bookableDates()
  const [duration, setDuration] = useState<DurationMin>(() => durationForServiceName(presetService()))
  const [date, setDate] = useState(firstBookableDate)
  const [startMinute, setStartMinute] = useState<number | null>(null)
  const [slots, setSlots] = useState<SlotOpen[]>([])
  const [capacity, setCapacity] = useState(2)
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<{ name?: string; time?: string; form?: string }>({})
  const [loadingTimes, setLoadingTimes] = useState(false)

  useEffect(() => {
    document.title = `Book — ${brand.name}`
    return () => {
      document.title = `${brand.name} — Eglinton West, Toronto`
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingTimes(true)
      try {
        const day = await fetchDay(date)
        if (cancelled) return
        setCapacity(day.capacity)
        const raw = duration === 30 ? day.slots30 ?? day.starts30.map((minute) => ({ minute, open: day.capacity })) : day.slots60 ?? day.starts60.map((minute) => ({ minute, open: day.capacity }))
        const next = raw.filter((slot) => slot.open > 0)
        setSlots(next)
        setStartMinute((current) => (current !== null && next.some((slot) => slot.minute === current) ? current : null))
        setErrors((current) => ({ ...current, form: undefined }))
      } catch (error) {
        if (cancelled) return
        setSlots([])
        setStartMinute(null)
        setErrors((current) => ({
          ...current,
          form: error instanceof BookingError ? error.message : "Could not load times. Call the shop.",
        }))
      } finally {
        if (!cancelled) setLoadingTimes(false)
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 2000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [date, duration])

  const ready = name.trim().length >= 2 && startMinute !== null
  const whatsappUrl =
    ready && startMinute !== null
      ? shopWhatsAppUrl(
          bookingWhatsAppText({
            name: name.trim(),
            date,
            startMinute,
            durationMin: duration,
          }),
        )
      : null

  function showErrors() {
    setErrors({
      name: name.trim().length < 2 ? "Please add your name." : undefined,
      time: startMinute === null ? "Pick a time that’s still open." : undefined,
    })
  }

  return (
    <div className="min-h-svh bg-ink text-bone">
      <Nav standalone />

      <main className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-8">
        <p className="type-label">Appointment</p>
        <h1 className="mt-2 font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
          Book a time.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone/70">
          {addressLine}. Send a WhatsApp to {notifyPhoneDisplay} to book — that message is the booking. The shop will
          reply OK and mark the chair. {WAIT_DISCLAIMER}
        </p>

        <form
          className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_16rem]"
          onSubmit={(event) => event.preventDefault()}
          noValidate
        >
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
            <p className="mt-2 text-xs leading-relaxed text-bone/55">
              {durationGuide.map((item) => `${item.length}: ${item.detail}`).join(" · ")}
            </p>

            <p className="type-label mt-6">Day</p>
            <div className="mt-2">
              <DateStrip wrap dates={dates} value={date} onChange={setDate} />
            </div>

            <p className="type-label mt-6">Open times</p>
              {loadingTimes && slots.length === 0 ? (
                <p className="mt-2 text-sm text-bone/65">Checking the board…</p>
              ) : slots.length === 0 ? (
                <p className="mt-2 text-sm text-bone/65">
                  No {duration}-minute times left this day. Try another day or call.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const selected = startMinute === slot.minute
                    return (
                      <button
                        key={slot.minute}
                        type="button"
                        onClick={() => {
                          setStartMinute(slot.minute)
                          setErrors((current) => ({ ...current, time: undefined }))
                        }}
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
            {errors.time ? <p className="mt-2 text-sm text-gold">{errors.time}</p> : null}
          </div>

          <div className="grid gap-5 md:sticky md:top-6">
            <Field id={`${baseId}-name`} label="Name" error={errors.name} errorId={`${baseId}-name-error`}>
              <input
                id={`${baseId}-name`}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
                className={fieldClass}
              />
            </Field>
            {errors.form ? <p className="text-sm text-gold">{errors.form}</p> : null}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                className="type-button inline-flex h-11 w-full items-center justify-center bg-gold px-5 text-ink"
              >
                Send WhatsApp to book
              </a>
            ) : (
              <button
                type="button"
                onClick={showErrors}
                className="type-button inline-flex h-11 w-full items-center justify-center bg-gold px-5 text-ink"
              >
                Send WhatsApp to book
              </button>
            )}
            <a
              href={cancelHref()}
              className="type-button inline-flex h-11 w-full items-center justify-center border border-bone/25 px-5"
            >
              Cancel on WhatsApp
            </a>
            <a
              href={phoneHref}
              className="type-button inline-flex h-11 w-full items-center justify-center border border-bone/25 px-5"
            >
              Call {phoneDisplay}
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  errorId,
  children,
}: {
  id: string
  label: string
  error?: string
  errorId: string
  children: ReactNode
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="type-label">{label}</span>
      {children}
      {error ? (
        <span id={errorId} className="mt-2 block text-sm text-gold">
          {error}
        </span>
      ) : null}
    </label>
  )
}
