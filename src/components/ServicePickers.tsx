import { MAX_BOOKING_SERVICES, priceLabel, services, timeLabel, type Service } from "../data"

export const selectClass =
  "mt-1.5 h-12 w-full border border-bone/20 bg-ink px-3 font-sans text-base text-bone outline-none focus:border-gold"

export function ServicePickers({
  idPrefix,
  values,
  onChangeAt,
  onAdd,
  onRemove,
  error,
}: {
  idPrefix: string
  values: string[]
  onChangeAt: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  error?: string
}) {
  return (
    <div className="grid gap-4">
      {values.map((value, index) => {
        const taken = values.filter((name, other) => other !== index && name)
        const choices = services.filter((item) => item.name === value || !taken.includes(item.name))
        const fieldId = `${idPrefix}-service-${index}`
        return (
          <div key={fieldId}>
            <div className="flex items-end gap-3">
              <label className="block min-w-0 flex-1" htmlFor={fieldId}>
                <span className="type-label">{index === 0 ? "Service" : "Added service"}</span>
                <select
                  id={fieldId}
                  className={selectClass}
                  value={value}
                  onChange={(event) => onChangeAt(index, event.target.value)}
                  aria-invalid={index === 0 ? Boolean(error) : undefined}
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
                  onClick={() => onRemove(index)}
                  className="type-label mb-0 inline-flex h-12 shrink-0 items-center border border-gold bg-gold px-3 text-ink"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
      {values.length < MAX_BOOKING_SERVICES && values.every(Boolean) ? (
        <button
          type="button"
          role="switch"
          aria-checked={false}
          onClick={onAdd}
          className="type-label inline-flex h-12 items-center justify-center border border-bone/25 px-3 text-bone"
        >
          Add a service
        </button>
      ) : null}
      {error ? <span className="text-sm text-gold">{error}</span> : null}
    </div>
  )
}

export function ServiceTimeNotes({ picked }: { picked: Service[] }) {
  if (picked.length === 0) return null
  const together = picked.reduce((sum, item) => sum + item.price, 0)
  return (
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
  )
}
