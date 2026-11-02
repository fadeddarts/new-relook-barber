import { mapsUrl, rating, reviews } from "../data"
import { Reveal } from "./ui"

export function Reviews() {
  const [lead, ...rest] = reviews

  return (
    <section id="reviews" className="bg-ink text-bone">
      <div className="shell py-16 md:py-24">
        <Reveal>
          <p className="type-label">From the chair</p>
          <h2 className="type-section mt-3">In their words.</h2>
        </Reveal>

        <blockquote className="mt-12 border-t border-bone/20 pt-8">
          <p className="font-display text-[clamp(1.8rem,4.2vw,3.6rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
            <span className="text-gold" aria-hidden="true">
              “
            </span>
            {lead.quote}
            <span aria-hidden="true">”</span>
          </p>
          <footer className="type-label mt-6">
            {lead.name} · {lead.source}
          </footer>
        </blockquote>

        <div className="mt-12 grid gap-10 border-t border-bone/15 pt-10 md:grid-cols-2">
          {rest.map((review) => (
            <blockquote key={review.name}>
              <p className="type-sub normal-case tracking-[-0.03em]">“{review.quote}”</p>
              <footer className="type-label mt-4 text-bone/55">
                {review.name} · {review.source}
              </footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-12">
          <a href={mapsUrl} className="type-label inline-flex border-b-2 border-gold pb-1">
            {rating.label}
          </a>
        </p>
      </div>
    </section>
  )
}
