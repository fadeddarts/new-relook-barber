import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type BookingContextValue = {
  open: boolean
  service: string | null
  openBooking: (service?: string) => void
  closeBooking: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [service, setService] = useState<string | null>(null)

  const value = useMemo<BookingContextValue>(
    () => ({
      open,
      service,
      openBooking: (next?: string) => {
        setService(next ?? null)
        setOpen(true)
      },
      closeBooking: () => setOpen(false),
    }),
    [open, service],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) throw new Error("useBooking must be used within BookingProvider")
  return context
}
