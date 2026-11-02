import { useEffect, useState } from "react"
import { shopStatus } from "./hours"

export function useShopStatus() {
  const [status, setStatus] = useState(() => shopStatus())

  useEffect(() => {
    const tick = () => setStatus(shopStatus())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return status
}
