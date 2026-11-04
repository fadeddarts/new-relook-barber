import { brand, navLinks, phoneDisplay, phoneHref } from "../data"
import { BookButton } from "./ui"
import { Mark } from "./Mark"

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-bone/15 bg-ink text-bone">
      <div className="px-5 pt-12 md:px-10 md:pt-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Mark labelled className="h-28 w-28 md:h-40 md:w-40" />
          <p className="font-display text-[clamp(4.2rem,15vw,10.5rem)] leading-[0.8] font-bold tracking-[-0.05em] uppercase">
            New
            <br />
            Relook
          </p>
        </div>
        <div className="mt-6 h-3 bg-gold" />
        <p className="type-body mt-8 max-w-md">Your look. Your rules. A barber chair on Eglinton West. Est. 2024.</p>
      </div>

      <div className="mt-12 flex flex-col gap-8 border-t border-bone/15 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-10">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="type-label inline-block py-1 hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <BookButton variant="ink">Book now</BookButton>
      </div>

      <div className="flex flex-col gap-2 border-t border-bone/15 px-5 py-5 text-sm md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          © {year} {brand.name}
        </p>
        <a href={phoneHref} className="type-label">
          {phoneDisplay}
        </a>
      </div>
    </footer>
  )
}
