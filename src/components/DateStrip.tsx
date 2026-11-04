import { formatDayHeading } from "../lib/time"

export function DateStrip({
  dates,
  value,
  onChange,
  wrap = false,
}: {
  dates: string[]
  value: string
  onChange: (date: string) => void
  wrap?: boolean
}) {
  return (
    <div
      className={wrap ? "grid grid-cols-3 gap-1.5 sm:grid-cols-4" : "flex gap-1.5 overflow-x-auto pb-1"}
      role="listbox"
      aria-label="Day"
    >
      {dates.map((date) => {
        const selected = date === value
        return (
          <button
            key={date}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(date)}
            className={`h-10 border px-1 font-sans text-[13px] ${wrap ? "w-full" : "w-[7.25rem] shrink-0"} ${
              selected ? "border-gold bg-gold text-ink" : "border-bone/20 text-bone"
            }`}
          >
            {formatDayHeading(date)}
          </button>
        )
      })}
    </div>
  )
}
