export type DurationMin = 30 | 60
export type BookingSource = "web" | "walkin"
export type AppointmentStatus = "booked" | "cancelled"

export type Appointment = {
  id: string
  date: string
  startMinute: number
  durationMin: DurationMin
  chairIndex: number
  source: BookingSource
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  cancelToken: string | null
  status: AppointmentStatus
}

export type OccupancyRow = {
  date: string
  chairIndex: number
  slotMinute: number
  appointmentId: string
}

export type SlotOpen = {
  minute: number
  open: number
}

export type DayAvailability = {
  date: string
  capacity: number
  openMinute: number
  closeMinute: number
  starts30: number[]
  starts60: number[]
  slots30: SlotOpen[]
  slots60: SlotOpen[]
}

export type OwnerTileChair =
  | { taken: false }
  | {
      taken: true
      appointmentId: string
      name: string
      phone: string | null
      email: string | null
      source: BookingSource
      startMinute: number
      durationMin: DurationMin
      continuation: boolean
    }

export type OwnerDay = {
  date: string
  capacity: number
  openMinute: number
  closeMinute: number
  tiles: { minute: number; chairs: OwnerTileChair[] }[]
}

export type BookRequest = {
  date: string
  startMinute: number
  durationMin: DurationMin
  name: string
  phone: string
  email: string
  siteBase?: string
}

export type BookResult = {
  id: string
  date: string
  startMinute: number
  durationMin: DurationMin
  name: string
  phone: string
  email: string
  cancelToken: string
  cancelUrl: string
  whatsappUrl: string
  emailSent: { customer: boolean; owner: boolean }
  sms: { customer: boolean; owner: boolean }
}

export type CancelResult = {
  ok: true
  date: string
  startMinute: number
  durationMin: DurationMin
  within24h: boolean
  emailSent: { customer: boolean; owner: boolean }
  sms: { customer: boolean; owner: boolean }
}
