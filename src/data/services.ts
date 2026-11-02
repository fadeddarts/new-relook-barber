/**
 * Prices that are numbers were supplied for the site.
 * Taper Fade and Complete Transformation have no published price.
 * Beard Trim uses the shop's published beard price of $25.
 */

export type Service = {
  id: string
  index: string
  name: string
  description: string
  minutes: number | null
  price: number | null
}

export const services: Service[] = [
  {
    id: "classic",
    index: "01",
    name: "Classic Haircut",
    description: "A clean shape, sides set, top left with enough length to wear your way.",
    minutes: 40,
    price: 35,
  },
  {
    id: "skin-fade",
    index: "02",
    name: "Skin Fade",
    description: "Blended down to the skin. The top still has a shape by Thursday.",
    minutes: 45,
    price: 40,
  },
  {
    id: "taper",
    index: "03",
    name: "Taper Fade",
    description: "A shorter neck and side that keeps a little weight. No published price yet.",
    minutes: null,
    price: null,
  },
  {
    id: "scissor",
    index: "04",
    name: "Scissor Cut",
    description: "Cut with shears so the hair keeps its movement instead of a clipped edge.",
    minutes: 50,
    price: 40,
  },
  {
    id: "beard",
    index: "05",
    name: "Beard Trim",
    description: "Cheek, neck, and length brought to one line. Sharp enough to read.",
    minutes: 20,
    price: 25,
  },
  {
    id: "cut-and-beard",
    index: "06",
    name: "Haircut & Beard",
    description: "The cut and the beard finished together, so they belong to the same face.",
    minutes: 70,
    price: 55,
  },
  {
    id: "transformation",
    index: "07",
    name: "Complete Transformation",
    description: "A full reset of the cut and the beard. The price is confirmed when you book.",
    minutes: null,
    price: null,
  },
]

export function priceLabel(price: number | null) {
  return price === null ? "Price on request" : `$${price}`
}

export function timeLabel(minutes: number | null) {
  return minutes === null ? "Time on request" : `${minutes} min`
}
