import { instagramUrl } from "./shop"
import { photo, type Shot } from "./media"

/**
 * Amir is the barber named in public reviews.
 * The photograph is an editorial stand-in, not a verified portrait of him.
 */

export type Barber = {
  name: string
  specialty: string
  intro: string
  instagram: string
  instagramLabel: string
  image: Shot
}

export const barber: Barber = {
  name: "Amir",
  specialty: "Fades, scissor cuts, beard work",
  intro:
    "Amir is the barber people book by name. Tell him the shape you want. He cuts that: a tight fade, a scissor cut with weight left in, a beard brought back to the jaw. The price stays fair, and the conversation comes with the chair.",
  instagram: instagramUrl,
  instagramLabel: "Shop Instagram",
  image: {
    src: photo("chair.jpg"),
    alt: "A barber's hands setting a hard part with a comb. Stand-in photograph, not a portrait of Amir.",
    width: 1800,
    height: 1201,
    position: "object-[center_40%]",
  },
}
