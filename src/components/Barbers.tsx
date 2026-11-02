import { barber, chairShot } from "../data"
import { BookButton, Frame, Reveal } from "./ui"

export function Barbers() {
  return (
    <section id="barbers" className="bg-ink text-bone">
      <div className="grid lg:grid-cols-12">
        <Frame className="lg:col-span-6">
          <div className="aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[640px]">
            <img
              src={chairShot.src}
              alt={chairShot.alt}
              width={chairShot.width}
              height={chairShot.height}
              className={`h-full w-full object-cover ${chairShot.position ?? ""}`}
            />
          </div>
        </Frame>

        <div className="flex flex-col justify-between gap-10 px-5 py-12 md:px-10 lg:col-span-6 lg:py-16">
          <Reveal>
            <p className="type-label text-gold">The barbers</p>
            <h2 className="type-display mt-4">{barber.name}</h2>
            <p className="type-label mt-5 inline-block bg-gold px-2 py-1 text-ink">{barber.specialty}</p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="type-body max-w-md text-bone/85">{barber.intro}</p>
            <p className="type-label mt-6 text-concrete">Photograph is a stand-in, not a portrait of Amir.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookButton service="Classic Haircut" variant="gold">
                Book with Amir
              </BookButton>
              <a
                href={barber.instagram}
                className="type-button inline-flex min-h-12 items-center border border-bone/30 px-5 hover:border-gold hover:bg-gold hover:text-ink"
              >
                {barber.instagramLabel}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
