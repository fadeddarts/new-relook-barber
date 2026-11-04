import type { IncomingMessage, ServerResponse } from "node:http"
import { assertDuration } from "../src/lib/slots.ts"
import { blockSlot, dropAppointment, getDay, ownerDay, ownerLogin, releaseTile, setCapacity } from "./boardStore.ts"

type Json = Record<string, unknown>

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

async function jsonBody(req: IncomingMessage) {
  const raw = await readBody(req)
  if (!raw) return {}
  return JSON.parse(raw) as Json
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(body))
}

function sessionOf(req: IncomingMessage) {
  const header = req.headers["x-owner-session"]
  return typeof header === "string" ? header : undefined
}

function errorStatus(error: unknown) {
  if (error && typeof error === "object" && "status" in error && typeof error.status === "number") {
    return error.status
  }
  return 500
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if ("message" in error && typeof (error as { message: string }).message === "string") {
      const text = error.message
      if (text === "UNAVAILABLE") return "That time was just taken."
      if (text === "AUTH" || text === "PIN") return error.message === "PIN" ? "Wrong PIN." : "Sign in again."
      if (text.length > 3 && text !== "DATE" && text !== "SLOT" && text !== "HOURS" && text !== "PAST") return text
    }
  }
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }
  return "Something went wrong."
}

export async function handleBooking(req: IncomingMessage, res: ServerResponse) {
  const host = req.headers.host ?? "localhost:5176"
  const url = new URL(req.url ?? "/", `http://${host}`)
  const path = url.pathname.replace(/\/$/, "") || "/"

  try {
    if (req.method === "GET" && path === "/api/booking/day") {
      const date = url.searchParams.get("date") ?? ""
      return send(res, 200, getDay(date))
    }

    if (req.method === "POST" && path === "/api/booking/owner/login") {
      const body = await jsonBody(req)
      return send(res, 200, ownerLogin(String(body.pin ?? "")))
    }

    if (req.method === "GET" && path === "/api/booking/owner/day") {
      const date = url.searchParams.get("date") ?? ""
      return send(res, 200, ownerDay(sessionOf(req), date))
    }

    if (req.method === "POST" && path === "/api/booking/owner/capacity") {
      const body = await jsonBody(req)
      return send(res, 200, setCapacity(sessionOf(req), String(body.date ?? ""), Number(body.capacity)))
    }

    if (req.method === "POST" && path === "/api/booking/owner/block") {
      const body = await jsonBody(req)
      return send(
        res,
        200,
        blockSlot(sessionOf(req), {
          date: String(body.date ?? ""),
          startMinute: Number(body.startMinute),
          durationMin: assertDuration(Number(body.durationMin)),
          name: typeof body.name === "string" ? body.name : undefined,
        }),
      )
    }

    if (req.method === "POST" && path === "/api/booking/owner/release") {
      const body = await jsonBody(req)
      return send(
        res,
        200,
        releaseTile(sessionOf(req), {
          date: String(body.date ?? ""),
          chairIndex: Number(body.chairIndex),
          slotMinute: Number(body.slotMinute),
        }),
      )
    }

    if (req.method === "POST" && path === "/api/booking/owner/drop") {
      const body = await jsonBody(req)
      return send(res, 200, dropAppointment(sessionOf(req), String(body.appointmentId ?? "")))
    }

    send(res, 404, { error: "Not found" })
  } catch (error) {
    send(res, errorStatus(error), { error: errorMessage(error) })
  }
}
