import { Barbers } from "./components/Barbers"
import { BookingDialog } from "./components/BookingDialog"
import { Footer } from "./components/Footer"
import { Hero } from "./components/Hero"
import { Intro } from "./components/Intro"
import { Lookbook } from "./components/Lookbook"
import { Nav } from "./components/Nav"
import { Reviews } from "./components/Reviews"
import { Services } from "./components/Services"
import { Shop } from "./components/Shop"
import { Visit } from "./components/Visit"
import { BookingProvider } from "./context/BookingContext"

export default function App() {
  return (
    <BookingProvider>
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
      <BookingDialog />
    </BookingProvider>
  )
}
