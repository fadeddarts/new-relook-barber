import { introShot, rating } from "../data"
import { Frame, Reveal } from "./ui"

export function Intro() {
  return (
    <section id="intro" className="bg-ink text-bone">
      <div className="shell grid items-end gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-7">
          <p className="type-label text-gold">The idea</p>
          <h2 className="type-section mt-4 max-w-[10ch]">
            Look good.
            <br />
            Feel different.
          </h2>
        </Reveal>
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.08}>
          <p className="type-body text-bone/85">
            Your look. Your rules. New Relook is a barber chair on Eglinton West for people who already know what they want, and for people who want a second opinion that stays honest.
          </p>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-12">
        <Frame className="lg:col-span-7">
          <div className="aspect-[4/5] sm:aspect-[16/10]">
            <img
              src={introShot.src}
              alt={introShot.alt}
              width={introShot.width}
              height={introShot.height}
              className={`h-full w-full object-cover ${introShot.position ?? ""}`}
            />
          </div>
        </Frame>
        <div className="flex flex-col justify-between gap-10 border-t border-bone/15 px-5 py-10 md:px-10 lg:col-span-5 lg:border-t-0 lg:border-l lg:border-bone/15 lg:py-12">
          <p className="type-body max-w-md text-bone/85">
            The work is straightforward. A fade that grows out clean. A scissor cut that still moves. A beard that matches the face you walked in with. Prices stay on the menu, and the chair is not a performance.
          </p>
          <div className="grid grid-cols-2 gap-6 border-t border-bone/15 pt-6">
            <div>
              <p className="font-display text-5xl leading-none tracking-[-0.04em]">{rating.value}</p>
              <p className="type-label mt-3 text-concrete">Google rating</p>
            </div>
            <div>
              <p className="font-display text-5xl leading-none tracking-[-0.04em]">{rating.count}</p>
              <p className="type-label mt-3 text-concrete">Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
