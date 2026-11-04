import { spawn } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "send_email.py")

export async function sendEmail(input: { to: string; subject: string; text: string }) {
  const to = input.to.trim()
  if (!to || !process.env.SMTP_HOST?.trim()) return false
  return new Promise<boolean>((resolve) => {
    const child = spawn("python3", [scriptPath], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    })
    let stderr = ""
    const timer = setTimeout(() => {
      child.kill("SIGKILL")
      console.error("email send timed out")
      resolve(false)
    }, 20000)
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })
    child.on("error", (error) => {
      clearTimeout(timer)
      console.error("email send failed", error)
      resolve(false)
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      if (code !== 0) {
        console.error("email send failed", stderr.trim() || `exit ${code}`)
        resolve(false)
        return
      }
      resolve(true)
    })
    child.stdin.write(JSON.stringify({ to, subject: input.subject, text: input.text }))
    child.stdin.end()
  })
}

export function ownerInbox() {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase()
  return email && email.includes("@") ? email : null
}
