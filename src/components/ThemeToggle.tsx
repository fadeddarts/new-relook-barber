import { useState } from "react"
import { applyTheme, type ThemeMode } from "../lib/theme"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    document.documentElement.classList.contains("light") ? "light" : "dark",
  )

  function toggle() {
    const next = mode === "dark" ? "light" : "dark"
    applyTheme(next)
    setMode(next)
  }

  return (
    <button
      type="button"
      className={`type-label inline-grid min-h-11 min-w-[4.75rem] place-items-center px-2 text-bone/70 transition-colors duration-200 hover:text-bone ${className}`}
      onClick={toggle}
      aria-pressed={mode === "light"}
      aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className="invisible col-start-1 row-start-1">Light</span>
      <span className="col-start-1 row-start-1">{mode === "light" ? "Dark" : "Light"}</span>
    </button>
  )
}
