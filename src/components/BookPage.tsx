import { useEffect, useId, useState, type ReactNode } from "react"
import {
  MAX_BOOKING_SERVICES,
  addressLine,
  brand,
  findService,
  findServices,
  notifyPhoneDisplay,
  phoneDisplay,
  phoneHref,
  priceLabel,
  services,
  timeLabel,
} from "../data"
import { fetchDay } from "../lib/bookingClient"
import { durationForServices } from "../lib/estimates"
import { hoursAsOpenSlots } from "../lib/slots"
import { WAIT_DISCLAIMER, bookableDates, firstBookableDate, formatClock } from "../lib/time"
import type { DayAvailability, SlotOpen } from "../lib/bookingTypes"
import { bookingWhatsAppText, shopWhatsAppUrl } from "../lib/whatsapp"
import { DateStrip } from "./DateStrip"
import { Nav } from "./Nav"

const fieldClass =
  "mt-1.5 w-full border-b border-bone/25 bg-transparent py-2 font-sans text-base text-bone outline-none focus:border-gold"

const selectClass =
  "mt-1.5 h-12 w-full border border-bone/20 bg-ink px-3 font-sans text-base text-bone outline-none focus:border-gold"

function presetService() {
  return new URLSearchParams(window.location.search).get("service")
}

function openSlotsFromDay(day: DayAvailability, duration: 30 | 60) {
  const raw =
    duration === 30
      ? (day.slots30 ?? day.starts30.map((minute) => ({ minute, open: day.capacity })))
      : (day.slots60 ?? day.starts60.map((minute) => ({ minute, open: day.capacity })))
  return raw.filter((slot) => slot.open > 0)
}

export function BookPage() {
  const baseId = useId()
  const dates = bookableDates()
  const [serviceNames, setServiceNames] = useState(() => [findService(presetService())?.name ?? ""])
  const [date, setDate] = useState(firstBookableDate)
  const [startMinute, setStartMinute] = useState<number | null>(null)
  const [slots, setSlots] = useState<SlotOpen[]>([])
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<{ name?: string; service?: string; time?: string; form?: string }>({})

  const picked = findServices(serviceNames)
  const duration = durationForServices(picked.map((item) => item.name))
  const together = picked.reduce((sum, item) => sum + item.price, 0)

  useEffect(() => {
    document.title = `Book — ${brand.name}`
    return () => {
      document.title = `${brand.name} — Eglinton West, Toronto`
    }
  }, [])

  useEffect(() => {
    if (picked.length === 0) {
      setSlots([])
      setStartMinute(null)
      return
    }
    const local = hoursAsOpenSlots(date, duration)
    setSlots(local)
    setStartMinute((current) => (current !== null && local.some((slot) => slot.minute === current) ? current : null))

    let cancelled = false
    let useBoard = true

    async function load() {
      if (!useBoard) return
      try {
        const day = await fetchDay(date)
        if (cancelled) return
        applySlots(openSlotsFromDay(day, duration))
      } catch {
        useBoard = false
        if (cancelled) return
        applySlots(local)
      }
    }

    function applySlots(next: SlotOpen[]) {
      setSlots(next)
      setStartMinute((current) => (current !== null && next.some((slot) => slot.minute === current) ? current : null))
      setErrors((current) => ({ ...current, form: undefined }))
    }
    void load()
    const timer = window.setInterval(() => void load(), 2000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [date, duration, picked.length])

  const ready = name.trim().length >= 2 && picked.length > 0 && startMinute !== null
  const whatsappUrl =
    ready && startMinute !== null
      ? shopWhatsAppUrl(
          bookingWhatsAppText({
            name: name.trim(),
            date,
            startMinute,
            durationMin: duration,
            services: picked.map((item) => ({ name: item.name, price: item.price, time: timeLabel(item) })),
          }),
        )
      : null

  function setServiceAt(index: number, value: string) {
    const next = serviceNames.slice()
    next[index] = value
    setServiceNames(next)
    setStartMinute(null)
    setErrors((current) => ({ ...current, service: undefined, time: undefined }))
  }

  function addService() {
    if (serviceNames.length >= MAX_BOOKING_SERVICES || serviceNames.some((name) => !name)) return
    setServiceNames([...serviceNames, ""])
    setStartMinute(null)
  }

  function removeService(index: number) {
    const next = serviceNames.filter((_, other) => other !== index)
    setServiceNames(next.length ? next : [""])
    setStartMinute(null)
  }

  function showErrors() {
    setErrors({
      name: name.trim().length < 2 ? "Please add your name." : undefined,
      service: picked.length > 0 ? undefined : "Pick a service.",
      time: startMinute === null ? "Pick a time that’s still open." : undefined,
    })
  }

  return (
    <div className="min-h-svh bg-ink text-bone">
      <Nav standalone />

      <main className="mx-auto max-w-xl px-5 py-6 md:px-8 md:py-8">
        <p className="type-label">Appointment</p>
        <h1 className="mt-2 font-display text-[1.85rem] leading-[0.95] font-bold tracking-[-0.04em] uppercase md:text-[2.5rem]">
          Book a time.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-bone/70">
          {addressLine}. Send a WhatsApp to {notifyPhoneDisplay} to book an appointment — that message is the
          booking. {WAIT_DISCLAIMER}
        </p>

        <form className="mt-8 grid gap-6" onSubmit={(event) => event.preventDefault()} noValidate>
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

          <div className="grid gap-4">
            {serviceNames.map((value, index) => {
              const taken = serviceNames.filter((name, other) => other !== index && name)
              const choices = services.filter((item) => item.name === value || !taken.includes(item.name))
              const fieldId = `${baseId}-service-${index}`
              return (
                <div key={fieldId}>
                  <div className="flex items-end gap-3">
                    <label className="block min-w-0 flex-1" htmlFor={fieldId}>
                      <span className="type-label">{index === 0 ? "Service" : "Added service"}</span>
                      <select
                        id={fieldId}
                        className={selectClass}
                        value={value}
                        onChange={(event) => setServiceAt(index, event.target.value)}
                        aria-invalid={index === 0 ? Boolean(errors.service) : undefined}
                      >
                        <option value="">{index === 0 ? "Choose a service" : "Choose another service"}</option>
                        {choices.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name} · {priceLabel(item.price)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {index > 0 ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={true}
                        aria-label="Remove this service"
                        onClick={() => removeService(index)}
                        className="type-label mb-0 inline-flex h-12 shrink-0 items-center border border-gold bg-gold px-3 text-ink"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
            {serviceNames.length < MAX_BOOKING_SERVICES && serviceNames.every(Boolean) ? (
              <button
                type="button"
                role="switch"
                aria-checked={false}
                onClick={addService}
                className="type-label inline-flex h-12 items-center justify-center border border-bone/25 px-3 text-bone"
              >
                Add a service
              </button>
            ) : null}
            {errors.service ? <span className="text-sm text-gold">{errors.service}</span> : null}
          </div>

          {picked.length > 0 ? (
            <div className="grid gap-2">
              {picked.map((item) => {
                const approx = timeLabel(item)
                return (
                  <p
                    key={item.id}
                    className="font-display text-[1.25rem] leading-none tracking-[-0.03em] text-bone/80 md:text-[1.5rem]"
                  >
                    {approx ? `${item.name} · about ${approx}` : item.name}
                  </p>
                )
              })}
              {picked.length > 1 ? (
                <p className="text-sm text-bone/65">Together {priceLabel(together)} + tax</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="type-label">Day</p>
            <div className="mt-2">
              <DateStrip wrap tall dates={dates} value={date} onChange={setDate} />
            </div>
          </div>

          <div>
            <p className="type-label">Open times</p>
            {picked.length === 0 ? (
              <p className="mt-2 text-sm text-bone/65">Pick a service to see open times.</p>
            ) : slots.length === 0 ? (
              <p className="mt-2 text-sm text-bone/65">No open times left this day. Please pick another day, or call.</p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                      className={`flex min-h-12 items-center justify-center border px-1 font-sans text-[15px] leading-none ${
                        selected ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                      }`}
                    >
                      {formatClock(slot.minute)}
                    </button>
                  )
                })}
              </div>
            )}
            {errors.time ? <p className="mt-2 text-sm text-gold">{errors.time}</p> : null}
          </div>

          {errors.form ? <p className="text-sm text-gold">{errors.form}</p> : null}

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              className="type-button inline-flex h-12 w-full items-center justify-center bg-gold px-5 text-ink"
            >
              Send WhatsApp to book
            </a>
          ) : (
            <button
              type="button"
              onClick={showErrors}
              className="type-button inline-flex h-12 w-full items-center justify-center bg-gold px-5 text-ink"
            >
              Send WhatsApp to book
            </button>
          )}
          <a
            href={phoneHref}
            className="type-button inline-flex h-12 w-full items-center justify-center border border-bone/25 px-5"
          >
            Call {phoneDisplay}
          </a>
          <p className="text-sm leading-relaxed text-bone/65">
            Need to cancel? Send the shop a WhatsApp.
          </p>
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
