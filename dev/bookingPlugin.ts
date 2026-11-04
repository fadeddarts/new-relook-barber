import { loadEnv, type Plugin } from "vite"
import { handleBooking } from "./bookingHandler.ts"

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "")
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
}

export function bookingDevPlugin(): Plugin {
  return {
    name: "booking-dev-api",
    config(_, { mode }) {
      applyEnv(mode)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/booking")) return next()
        void handleBooking(req, res).catch((error) => {
          console.error(error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ error: "Server error" }))
          }
        })
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/booking")) return next()
        void handleBooking(req, res).catch((error) => {
          console.error(error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ error: "Server error" }))
          }
        })
      })
    },
  }
}
