/**
 * Facts for New Relook Barber shop, Eglinton West.
 * This folder is not imported by the Natural Barber Shop site
 * or by the-social-club.
 */

export const brand = {
  name: "New Relook Barber shop",
  wordmark: "New Relook",
  descriptor: "Barber shop",
}

export const phoneDisplay = "(647) 222-3540"
export const phoneHref = "tel:+16472223540"
export const smsHref = "sms:+16472223540"
export const email = "newrelook3@gmail.com"

export const address = {
  street: "1054 Eglinton Ave W",
  city: "Toronto",
  region: "ON",
  postal: "M6C 2C5",
  country: "CA",
  neighbourhood: "Eglinton West",
  note: "Between Bathurst Street and Allen Road",
}

export const addressLine = `${address.street}, ${address.city}, ${address.region} ${address.postal}`

export const geo = {
  latitude: 43.700113,
  longitude: -79.430588,
}

const mapsQuery = `${brand.name}, ${addressLine}`

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLine)}`
export const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=16&output=embed`

export const rating = {
  value: "5.0",
  count: 341,
  label: "5.0 from 341 Google reviews",
}

export const instagramUrl = "https://www.instagram.com/new_relook_barbershop/"
export const tiktokUrl = "https://www.tiktok.com/@new.relook.barber"

export type SocialId = "instagram" | "tiktok"

export const socials: { id: SocialId; label: string; href: string }[] = [
  { id: "instagram", label: "Instagram", href: instagramUrl },
  { id: "tiktok", label: "TikTok", href: tiktokUrl },
]

export const navLinks = [
  { id: "top", label: "Home" },
  { id: "services", label: "Services" },
  { id: "barbers", label: "The Barbers" },
  { id: "lookbook", label: "The Lookbook" },
  { id: "contact", label: "Contact" },
]

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

export type DayHours = {
  day: string
  short: Weekday
  open: number
  close: number
}

/** Monday–Saturday 10 a.m.–8 p.m. Sunday 10 a.m.–6 p.m. */
export const week: DayHours[] = [
  { day: "Monday", short: "Mon", open: 10, close: 20 },
  { day: "Tuesday", short: "Tue", open: 10, close: 20 },
  { day: "Wednesday", short: "Wed", open: 10, close: 20 },
  { day: "Thursday", short: "Thu", open: 10, close: 20 },
  { day: "Friday", short: "Fri", open: 10, close: 20 },
  { day: "Saturday", short: "Sat", open: 10, close: 20 },
  { day: "Sunday", short: "Sun", open: 10, close: 18 },
]

export const reviews = [
  {
    name: "Omar Hasham",
    quote: "Best in town, best prices, and the best quality.",
    source: "Google review",
  },
  {
    name: "Ian Barrett",
    quote: "Well priced, efficient and super friendly service; give him a try!",
    source: "Google review",
  },
  {
    name: "Soham Ray",
    quote: "Nice ambiance, fair prices, solid haircut, and good conversation.",
    source: "Google review",
  },
]
