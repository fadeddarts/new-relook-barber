import { priceLabel, services, timeLabel } from "../data"
import { BookButton, Reveal } from "./ui"

export function Services() {
  return (
    <section id="services" className="bg-ink text-bone">
      <div className="shell py-16 md:py-24">
        <Reveal className="flex flex-col gap-4 border-b border-bone/20 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="type-label">Services</p>
            <h2 className="type-section mt-3">The menu.</h2>
          </div>
          <p className="type-body max-w-sm text-bone/70">
            Prices in Canadian dollars, plus tax. Sunday chairs finish at 6 p.m.
          </p>
        </Reveal>

        <ul>
          {services.map((service) => (
            <li key={service.id} className="border-b border-bone/15 py-7 md:py-9">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <p className="order-1 bg-gold px-2 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none tracking-[-0.04em] text-ink">
                  {service.index}
                </p>
                <p className="order-2 flex items-baseline gap-2 md:order-3">
                  <span className="font-display text-[clamp(1.7rem,3vw,2.6rem)] leading-none tracking-[-0.04em]">
                    {priceLabel(service.price)}
                  </span>
                  <span className="type-label text-bone/50">+ tax</span>
                </p>
                <h3 className="type-sub order-3 w-full md:order-2 md:w-auto md:min-w-0 md:flex-1">
                  {service.name}
                </h3>
              </div>
              <div className="mt-4 md:pl-[4.5rem]">
                <p className="type-body max-w-xl text-bone/70">{service.description}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="type-label text-bone/55">{timeLabel(service.minutes)}</p>
                  <BookButton service={service.name} variant="line" className="min-h-11">
                    Book
                  </BookButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
