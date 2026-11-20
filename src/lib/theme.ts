export type ThemeMode = "dark" | "light"

const storageKey = "nr-theme"

export function readTheme(): ThemeMode {
  try {
    return localStorage.getItem(storageKey) === "light" ? "light" : "dark"
  } catch {
    return "dark"
  }
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("light", mode === "light")
  document.documentElement.style.colorScheme = mode
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute("content", mode === "light" ? "#f4f1ea" : "#111111")
  try {
    localStorage.setItem(storageKey, mode)
  } catch {
    /* ignore quota / private mode */
  }
}
