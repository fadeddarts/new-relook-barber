import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { restoreSpaPath } from "./lib/route"
import { applyTheme, readTheme } from "./lib/theme"

applyTheme(readTheme())
restoreSpaPath()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
