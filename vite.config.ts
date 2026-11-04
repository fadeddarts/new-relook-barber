import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { bookingDevPlugin } from "./dev/bookingPlugin.ts"

export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss(), bookingDevPlugin()],
  server: {
    port: 5176,
  },
})
