import { lookbook } from "../data"
import { Reveal } from "./ui"

export function Lookbook() {
  return (
    <section id="lookbook" className="bg-ink text-bone">
      <div className="shell py-16 md:py-24">
        <Reveal className="grid gap-6 border-b border-bone/20 pb-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="type-label">The lookbook</p>
            <h2 className="type-section mt-3 max-w-[12ch]">Cuts, lines, and the chair.</h2>
          </div>
          <p className="type-body text-bone/70 md:col-span-5">
            Editorial studies of fades, lines, and beard work. These are not the shop’s own pictures, and there are no before-and-afters yet.
          </p>
        </Reveal>

        <ul className="mt-8 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-12 md:gap-x-5">
          {lookbook.map((look) => (
            <li key={look.index} className={look.span}>
              <div className={`overflow-hidden bg-ink ${look.aspect}`}>
                <img
                  src={look.image.src}
                  alt={look.image.alt}
                  width={look.image.width}
                  height={look.image.height}
                  className={`h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100 ${look.image.position ?? ""}`}
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className="type-label">{look.index}</p>
                <p className="type-sub text-right">{look.title}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
