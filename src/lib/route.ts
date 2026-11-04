export type AppRoute =
  | { name: "site" }
  | { name: "book" }
  | { name: "board" }
  | { name: "cancel"; token: string }

export function pathFromLocation(pathname = window.location.pathname): AppRoute {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  let rest = pathname
  if (base && rest.startsWith(base)) rest = rest.slice(base.length)
  const parts = rest.split("/").filter(Boolean)
  if (parts[0] === "book") return { name: "book" }
  if (parts[0] === "board") return { name: "board" }
  if (parts[0] === "cancel") return { name: "cancel", token: parts[1] ?? "" }
  return { name: "site" }
}

export function restoreSpaPath() {
  const saved = sessionStorage.getItem("nr-path")
  if (!saved) return
  sessionStorage.removeItem("nr-path")
  history.replaceState(null, "", saved)
}

export function hrefFor(path: string) {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${path.replace(/^\//, "")}`
}

export function bookHref(service?: string) {
  const path = hrefFor("book")
  if (!service) return path
  return `${path}?service=${encodeURIComponent(service)}`
}

export function homeHref(hash?: string) {
  const home = hrefFor("")
  if (!hash) return home
  return `${home}#${hash.replace(/^#/, "")}`
}

export function cancelHref() {
  return hrefFor("cancel")
}
