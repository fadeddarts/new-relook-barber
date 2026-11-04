export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase()
  if (email.length < 6 || email.length > 254) return null
  const at = email.indexOf("@")
  if (at < 1 || at !== email.lastIndexOf("@")) return null
  const domain = email.slice(at + 1)
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return null
  if (/\s/.test(email) || email.includes("..")) return null
  return email
}
