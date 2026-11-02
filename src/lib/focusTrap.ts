export function trapFocus(node: HTMLElement, onEscape: () => void) {
  const previous = document.activeElement as HTMLElement | null
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = "hidden"

  const focusable = () =>
    Array.from(
      node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    )

  window.setTimeout(() => focusable()[0]?.focus(), 30)

  function onKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onEscape()
      return
    }
    if (event.key !== "Tab") return
    const items = focusable()
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  document.addEventListener("keydown", onKey)
  return () => {
    document.removeEventListener("keydown", onKey)
    document.body.style.overflow = previousOverflow
    previous?.focus()
  }
}
