import { address, toolsShot } from "../data"
import { Frame, Reveal } from "./ui"

export function Shop() {
  return (
    <section id="shop" className="bg-ink text-bone">
      <div className="grid lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-8 px-5 py-14 md:px-10 lg:col-span-5 lg:py-20">
          <Reveal>
            <p className="type-label text-gold">The shop</p>
            <h2 className="type-section mt-4">
              A chair
              <br />
              on Eglinton.
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="type-body max-w-md text-bone/85">
              {address.street}, between Bathurst and Allen. Walk in when a chair is free, or book so Amir is actually waiting. The pictures here show the work, not the room.
            </p>
          </Reveal>
        </div>
        <Frame className="lg:col-span-7">
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[520px]">
            <img
              src={toolsShot.src}
              alt={toolsShot.alt}
              width={toolsShot.width}
              height={toolsShot.height}
              className={`h-full w-full object-cover ${toolsShot.position ?? ""}`}
            />
          </div>
        </Frame>
      </div>
    </section>
  )
}
