import { address, brand, email, navLinks, phoneDisplay, phoneHref, socials, week } from "../data"
import { formatRange } from "../lib/hours"
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

      <div className="mt-12 grid gap-10 border-t border-bone/15 px-5 py-10 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        <div>
          <p className="type-label">Visit</p>
          <p className="mt-3">
            {address.street}
            <br />
            {address.city}, {address.region} {address.postal}
          </p>
          <a href={phoneHref} className="mt-3 block">
            {phoneDisplay}
          </a>
          <a href={`mailto:${email}`} className="mt-1 block break-all">
            {email}
          </a>
        </div>
        <div>
          <p className="type-label">Hours</p>
          <ul className="mt-3">
            {week.map((day) => (
              <li key={day.short} className="flex justify-between gap-4 py-1 text-sm">
                <span>{day.short}</span>
                <span>{formatRange(day.open, day.close)}</span>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <p className="type-label">Index</p>
          <ul className="mt-3">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="inline-block py-1 hover:bg-gold hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="type-label">Follow</p>
          <ul className="mt-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} className="inline-block py-1 hover:bg-gold hover:text-ink">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <BookButton variant="ink">Book now</BookButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-bone/15 px-5 py-5 text-sm md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          © {year} {brand.name}
        </p>
        <p className="type-label">Barber shop · Eglinton West</p>
      </div>
    </footer>
  )
}
