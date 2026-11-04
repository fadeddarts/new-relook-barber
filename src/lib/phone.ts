export function digitsOf(value: string) {
  return value.replace(/\D/g, "")
}

export function normalizePhone(value: string) {
  let digits = digitsOf(value)
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1)
  if (digits.length !== 10) return null
  return `+1${digits}`
}

export function displayPhone(e164: string) {
  const digits = digitsOf(e164).slice(-10)
  if (digits.length !== 10) return e164
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
