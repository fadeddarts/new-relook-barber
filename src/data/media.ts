export type Shot = {
  src: string
  alt: string
  width: number
  height: number
  position?: string
}

export function photo(file: string) {
  return `${import.meta.env.BASE_URL}images/${file}`
}
