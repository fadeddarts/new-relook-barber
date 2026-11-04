import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { addressLine, brand, email, phoneDisplay, phoneHref, services, smsHref } from "../data"
import { priceLabel } from "../data/services"
import { useBooking } from "../context/BookingContext"
import { trapFocus } from "../lib/focusTrap"

type Fields = {
  name: string
  phone: string
  service: string
  day: string
  time: string
  note: string
}

const empty: Fields = {
  name: "",
  phone: "",
  service: "",
  day: "",
  time: "",
  note: "",
}

const slots = Array.from({ length: 20 }, (_, index) => {
  const hour = 10 + Math.floor(index / 2)
  const minute = index % 2 === 0 ? 0 : 30
  const minutes = hour * 60 + minute
  const suffix = hour >= 12 ? "p.m." : "a.m."
  const h = hour % 12 === 0 ? 12 : hour % 12
  return { label: `${h}:${String(minute).padStart(2, "0")} ${suffix}`, minutes }
})

function todayValue() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function isSunday(value: string) {
  if (!value) return false
  return new Date(`${value}T12:00:00`).getDay() === 0
}

export function BookingDialog() {
  const { open, service, closeBooking } = useBooking()
  if (!open) return null
  return <Dialog preset={service ?? ""} onClose={closeBooking} />
}

function Dialog({ preset, onClose }: { preset: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const baseId = useId()
  const [form, setForm] = useState<Fields>({ ...empty, service: preset })
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    return trapFocus(node, onClose)
  }, [onClose, sent])

  function update(field: keyof Fields, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === "day" && isSunday(value)) {
        const chosen = slots.find((slot) => slot.label === current.time)
        if (chosen && chosen.minutes >= 18 * 60) next.time = ""
      }
      return next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Partial<Fields> = {}
    if (form.name.trim().length < 2) next.name = "Please add your name."
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Please add a phone number."
    if (!form.service) next.service = "Please choose a service."
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const text = [
      `Hello ${brand.name} — I would like to book an appointment.`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Service: ${form.service}`,
      form.day || form.time ? `When: ${[form.day, form.time].filter(Boolean).join(" · ")}` : "When: flexible",
      form.note.trim() ? `Note: ${form.note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    setMessage(text)
    setSent(true)
    window.location.href = `${smsHref}?&body=${encodeURIComponent(text)}`
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const fieldClass =
    "mt-2 w-full border-b border-bone/25 bg-transparent py-2.5 font-sans text-base text-bone outline-none focus:border-gold"

  const timeOptions = slots.filter((slot) => (isSunday(form.day) ? slot.minutes < 18 * 60 : true))
  const smsLink = `${smsHref}?&body=${encodeURIComponent(message)}`
  const mailLink = `mailto:${email}?subject=${encodeURIComponent(`Appointment request — ${brand.name}`)}&body=${encodeURIComponent(message)}`

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/75 p-3 sm:items-center" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[min(92svh,840px)] w-full max-w-[640px] overflow-y-auto border border-bone/15 bg-ink p-6 text-bone sm:p-10"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="type-label">Appointment</p>
            <h2 id={`${baseId}-title`} className="type-section mt-3 text-bone">
              {sent ? "Request ready." : "Book a time."}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="type-label min-h-11 px-1 text-bone">
            Close
          </button>
        </div>

        {sent ? (
          <div className="mt-8">
            <p className="max-w-md">
              A text to {phoneDisplay} should be opening. If this device cannot send it, email the request or call the shop.
            </p>
            <pre className="mt-6 border-t border-bone/15 pt-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-bone">
              {message}
            </pre>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={smsLink} className="type-button inline-flex min-h-12 items-center bg-gold px-5 text-ink">
                Text the shop
              </a>
              <a href={mailLink} className="type-button inline-flex min-h-12 items-center border border-bone/25 px-5">
                Email
              </a>
              <a href={phoneHref} className="type-button inline-flex min-h-12 items-center border border-bone/25 px-5">
                Call
              </a>
              <button type="button" onClick={copy} className="type-button inline-flex min-h-12 items-center px-2">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 grid gap-6" onSubmit={submit} noValidate>
            <p className="max-w-md text-sm leading-relaxed">
              {addressLine}. Monday to Saturday, 10 a.m. to 8 p.m. Sunday, 10 a.m. to 6 p.m. The shop confirms by text or phone.
            </p>

            <Field id={`${baseId}-name`} label="Name" error={errors.name} errorId={`${baseId}-name-error`}>
              <input
                id={`${baseId}-name`}
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
                className={fieldClass}
              />
            </Field>

            <Field id={`${baseId}-phone`} label="Phone" error={errors.phone} errorId={`${baseId}-phone-error`}>
              <input
                id={`${baseId}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${baseId}-phone-error` : undefined}
                className={fieldClass}
              />
            </Field>

            <Field id={`${baseId}-service`} label="Service" error={errors.service} errorId={`${baseId}-service-error`}>
              <select
                id={`${baseId}-service`}
                name="service"
                value={form.service}
                onChange={(event) => update("service", event.target.value)}
                aria-invalid={Boolean(errors.service)}
                aria-describedby={errors.service ? `${baseId}-service-error` : undefined}
                className={`${fieldClass} scheme-light`}
              >
                <option value="">Choose a service</option>
                {services.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} — {priceLabel(item.price)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block" htmlFor={`${baseId}-day`}>
                <span className="type-label">Preferred day</span>
                <input
                  id={`${baseId}-day`}
                  name="day"
                  type="date"
                  min={todayValue()}
                  value={form.day}
                  onChange={(event) => update("day", event.target.value)}
                  className={`${fieldClass} scheme-light`}
                />
              </label>
              <label className="block" htmlFor={`${baseId}-time`}>
                <span className="type-label">Preferred time</span>
                <select
                  id={`${baseId}-time`}
                  name="time"
                  value={form.time}
                  onChange={(event) => update("time", event.target.value)}
                  className={`${fieldClass} scheme-light`}
                >
                  <option value="">Flexible</option>
                  {timeOptions.map((slot) => (
                    <option key={slot.label} value={slot.label}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-sm text-bone/65">Sunday appointments finish by 6 p.m.</p>

            <label className="block" htmlFor={`${baseId}-note`}>
              <span className="type-label">Note</span>
              <textarea
                id={`${baseId}-note`}
                name="note"
                rows={3}
                value={form.note}
                onChange={(event) => update("note", event.target.value)}
                className={`${fieldClass} resize-none`}
              />
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="type-button inline-flex min-h-12 items-center bg-gold px-5 text-ink">
                Text the shop
              </button>
              <a href={phoneHref} className="type-button inline-flex min-h-12 items-center border border-bone/25 px-5">
                Call {phoneDisplay}
              </a>
            </div>
          </form>
        )}
      </div>
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
