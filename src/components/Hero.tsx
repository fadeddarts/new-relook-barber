import { motion, useReducedMotion } from "framer-motion"
import { heroShot } from "../data"
import { BookButton } from "./ui"
import { Mark } from "./Mark"

const lines = ["Get", "A fresh", "Relook."]
const ease = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section id="top" className="border-b border-bone/15 bg-ink text-bone">
      <div className="grid lg:grid-cols-12">
        <div className="relative order-1 aspect-[4/5] border-b-[12px] border-gold sm:aspect-[5/4] lg:order-2 lg:col-span-5 lg:aspect-[4/5] lg:border-b-0 lg:border-l-[12px]">
          <img
            src={heroShot.src}
            alt={heroShot.alt}
            width={heroShot.width}
            height={heroShot.height}
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${heroShot.position ?? ""}`}
          />
          <Mark labelled className="absolute right-4 bottom-4 h-16 w-16 lg:right-6 lg:bottom-6 lg:h-20 lg:w-20" />
        </div>

        <div className="order-2 flex flex-col justify-between gap-8 px-5 py-8 md:px-10 lg:order-1 lg:col-span-7 lg:py-12">
          <p className="type-label">Toronto · Eglinton West</p>

          <h1 className="type-display">
            {lines.map((line, index) => (
              <motion.span
                key={line}
                className={`block ${index === 1 ? "stroke-bone" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 + index * 0.08, ease }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="type-body max-w-xs">More than a fresh cut. A fresh perspective.</p>
            <div className="flex flex-wrap gap-3">
              <BookButton>Book now</BookButton>
              <a href="#lookbook" className="type-button inline-flex min-h-12 items-center border border-bone px-5 hover:border-gold hover:bg-gold hover:text-ink">
                Lookbook
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
