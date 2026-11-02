import { useEffect, useState } from "react"
import { navLinks } from "../data"

const sectionIds = navLinks.map((item) => item.id)

export function useActiveSection() {
  const [active, setActive] = useState(sectionIds[0] ?? "top")

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))

    const update = () => {
      const probe = window.innerHeight * 0.36
      const current = nodes.find((node) => {
        const rect = node.getBoundingClientRect()
        return rect.top <= probe && rect.bottom >= probe
      })
      if (current) setActive(current.id)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return active
}
