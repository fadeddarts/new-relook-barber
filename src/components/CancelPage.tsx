import { useId, useState } from "react"
import { notifyPhoneDisplay, phoneDisplay, phoneHref } from "../data"
import { bookHref, homeHref } from "../lib/route"
import { startMinutesFor } from "../lib/slots"
import { WAIT_DISCLAIMER, bookableDates, firstBookableDate, formatClock } from "../lib/time"
import { cancelWhatsAppText, shopWhatsAppUrl } from "../lib/whatsapp"
import { DateStrip } from "./DateStrip"
import { Nav } from "./Nav"

const fieldClass =
  "mt-1.5 w-full border-b border-bone/25 bg-transparent py-2 font-sans text-base text-bone outline-none focus:border-gold"

export function CancelPage() {
  const baseId = useId()
  const dates = bookableDates()
  const [name, setName] = useState("")
  const [date, setDate] = useState(firstBookableDate)
  const [startMinute, setStartMinute] = useState<number | null>(null)
  const [errors, setErrors] = useState<{ name?: string; time?: string }>({})
  const starts = startMinutesFor(date, 30)

  const ready = name.trim().length >= 2 && startMinute !== null
  const whatsappUrl =
    ready && startMinute !== null
      ? shopWhatsAppUrl(cancelWhatsAppText({ name: name.trim(), date, startMinute }))
      : null

  function showErrors() {
    setErrors({
      name: name.trim().length < 2 ? "Please add your name." : undefined,
      time: startMinute === null ? "Pick the time you need to drop." : undefined,
    })
  }

  return (
    <div className="min-h-svh bg-ink text-bone">
      <Nav standalone />
      <main className="mx-auto max-w-lg px-5 py-12">
        <p className="type-label">Cancel</p>
        <h1 className="type-section mt-3">Drop a time.</h1>
        <p className="mt-4 text-sm leading-relaxed text-bone/70">
          Send a WhatsApp to {notifyPhoneDisplay}. That message is the cancel. The shop will free the chair on the
          board. {WAIT_DISCLAIMER}
        </p>

        <div className="mt-8 grid gap-6">
          <label className="block" htmlFor={`${baseId}-name`}>
            <span className="type-label">Name</span>
            <input
              id={`${baseId}-name`}
              className={fieldClass}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? <span className="mt-2 block text-sm text-gold">{errors.name}</span> : null}
          </label>

          <div>
            <p className="type-label">Day</p>
            <div className="mt-2">
              <DateStrip wrap dates={dates} value={date} onChange={setDate} />
            </div>
          </div>

          <div>
            <p className="type-label">Time</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {starts.map((minute) => {
                const selected = startMinute === minute
                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => {
                      setStartMinute(minute)
                      setErrors((current) => ({ ...current, time: undefined }))
                    }}
                    className={`h-10 border px-1 font-sans text-[13px] ${
                      selected ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
                    }`}
                  >
                    {formatClock(minute)}
                  </button>
                )
              })}
            </div>
            {errors.time ? <p className="mt-2 text-sm text-gold">{errors.time}</p> : null}
          </div>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              className="type-button inline-flex h-11 items-center justify-center bg-gold px-5 text-ink"
            >
              Send WhatsApp to cancel
            </a>
          ) : (
            <button
              type="button"
              onClick={showErrors}
              className="type-button inline-flex h-11 items-center justify-center bg-gold px-5 text-ink"
            >
              Send WhatsApp to cancel
            </button>
          )}
        </div>

        <p className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a href={bookHref()} className="text-gold">
            Book a time
          </a>
          <a href={homeHref()}>Home</a>
          <a href={phoneHref}>Call {phoneDisplay}</a>
        </p>
      </main>
    </div>
  )
}
