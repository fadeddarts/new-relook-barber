/**
 * Menu copied from the shop price list: name and dollar price, plus tax.
 */

export type Service = {
  id: string
  index: string
  name: string
  description: string
  minutes: number
  time?: string
  price: number
}

export const services: Service[] = [
  {
    id: "haircut",
    index: "01",
    name: "Haircut",
    description: "A clean shape, sides set, top left with enough length to wear your way.",
    minutes: 30,
    time: "20–30 min",
    price: 35,
  },
  {
    id: "beard",
    index: "02",
    name: "Beard Trim",
    description: "Cheek, neck, and length brought to one line. Sharp enough to read.",
    minutes: 20,
    time: "15–20 min",
    price: 25,
  },
  {
    id: "cut-and-beard",
    index: "03",
    name: "Haircut & Beard",
    description: "The cut and the beard finished together, so they belong to the same face.",
    minutes: 60,
    time: "45–60 min",
    price: 55,
  },
  {
    id: "neck",
    index: "04",
    name: "Neck Trim",
    description: "The neckline cleaned up without a full haircut.",
    minutes: 20,
    time: "15–20 min",
    price: 20,
  },
  {
    id: "towel-mask",
    index: "05",
    name: "Hot Towel with Face Mask",
    description: "A hot towel and a face mask at the chair.",
    minutes: 15,
    price: 10,
  },
  {
    id: "towel",
    index: "06",
    name: "Hot Towel Only",
    description: "A hot towel at the chair, on its own.",
    minutes: 10,
    price: 5,
  },
  {
    id: "wash",
    index: "07",
    name: "Hair Wash",
    description: "A wash before the cut, or on its own.",
    minutes: 15,
    time: "15 min",
    price: 10,
  },
  {
    id: "waxing",
    index: "08",
    name: "Nose & Ear Waxing",
    description: "A quick clean-up. Nose and ears.",
    minutes: 10,
    time: "10 min",
    price: 10,
  },
]

export function priceLabel(price: number) {
  return `$${price}`
}

export function timeLabel(service: Service) {
  return service.time ?? null
}

export const MAX_BOOKING_SERVICES = 3

export function findService(value: string | null | undefined) {
  if (!value) return null
  const decoded = decodeURIComponent(value).trim().toLowerCase()
  return (
    services.find((item) => item.name.toLowerCase() === decoded || item.id.toLowerCase() === decoded) ?? null
  )
}

export function findServices(names: string[]) {
  return names.map((name) => findService(name)).filter((item): item is Service => Boolean(item))
}
