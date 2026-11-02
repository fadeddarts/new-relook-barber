import { brand } from "../data"

const src = `${import.meta.env.BASE_URL}logo-mark.png?v=2`

type MarkProps = {
  className?: string
  labelled?: boolean
}

export function Mark({ className = "h-10 w-10", labelled = false }: MarkProps) {
  return (
    <img
      src={src}
      alt={labelled ? brand.name : ""}
      width={703}
      height={703}
      decoding="async"
      className={className}
    />
  )
}
