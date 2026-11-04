import { useEffect, useState } from "react"
import { Barbers } from "./components/Barbers"
import { BookPage } from "./components/BookPage"
import { CancelPage } from "./components/CancelPage"
import { Footer } from "./components/Footer"
import { Hero } from "./components/Hero"
import { Intro } from "./components/Intro"
import { Lookbook } from "./components/Lookbook"
import { Nav } from "./components/Nav"
import { OwnerBoard } from "./components/OwnerBoard"
import { Reviews } from "./components/Reviews"
import { Services } from "./components/Services"
import { Shop } from "./components/Shop"
import { Visit } from "./components/Visit"
import { pathFromLocation } from "./lib/route"

export default function App() {
  const [route, setRoute] = useState(pathFromLocation)

  useEffect(() => {
    const onPop = () => setRoute(pathFromLocation())
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  if (route.name === "book") return <BookPage />
  if (route.name === "board") return <OwnerBoard />
  if (route.name === "cancel") return <CancelPage />

  return (
    <>
      <a href="#intro" className="skip-link type-label">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Services />
        <Barbers />
        <Lookbook />
        <Shop />
        <Reviews />
        <Visit />
      </main>
      <Footer />
    </>
  )
}
