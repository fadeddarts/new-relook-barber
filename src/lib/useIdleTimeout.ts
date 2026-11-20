import { useEffect } from "react"

const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const

export function useIdleTimeout(enabled: boolean, ms: number, onIdle: () => void) {
  useEffect(() => {
    if (!enabled) return
    let timer = window.setTimeout(onIdle, ms)
    function bump() {
      window.clearTimeout(timer)
      timer = window.setTimeout(onIdle, ms)
    }
    for (const event of events) window.addEventListener(event, bump, { passive: true })
    return () => {
      window.clearTimeout(timer)
      for (const event of events) window.removeEventListener(event, bump)
    }
  }, [enabled, ms, onIdle])
}
