import {
  address,
  addressLine,
  directionsUrl,
  email,
  mapEmbedUrl,
  phoneDisplay,
  phoneHref,
  week,
} from "../data"
import { formatRange } from "../lib/hours"
import { useShopStatus } from "../lib/useShopStatus"
import { BookButton } from "./ui"
import { SocialLinks } from "./SocialLinks"

export function Visit() {
  const status = useShopStatus()

  return (
    <section id="contact" className="bg-ink text-bone">
      <div className="grid lg:grid-cols-12">
        <div className="px-5 py-14 md:px-10 lg:col-span-5 lg:py-20">
          <p className="type-label text-gold">Contact</p>
          <h2 className="type-section mt-4">Book the chair.</h2>
          <p className="type-body mt-6 max-w-md text-bone/85">
            {status.label} Walk-ins are welcome when a chair is free. An appointment is the surer way.
          </p>
          <div className="mt-8">
            <BookButton>Book now</BookButton>
          </div>

          <dl className="mt-12 grid gap-6 border-t border-bone/20 pt-8">
            <div>
              <dt className="type-label text-concrete">Visit</dt>
              <dd className="mt-2">
                <a href={directionsUrl} className="type-sub">
                  {address.street}
                </a>
                <p className="mt-1 text-bone/80">
                  {address.city}, {address.region} {address.postal}
                </p>
                <p className="mt-1 text-bone/70">{address.note}</p>
              </dd>
            </div>
            <div>
              <dt className="type-label text-concrete">Call or write</dt>
              <dd className="mt-2 flex flex-col items-start gap-1">
                <a href={phoneHref} className="type-sub">
                  {phoneDisplay}
                </a>
                <a href={`mailto:${email}`} className="text-bone/80 underline decoration-gold underline-offset-4">
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="type-label text-concrete">Hours</dt>
              <dd className="mt-2">
                <ul>
                  {week.map((day) => (
                    <li key={day.short} className="flex justify-between gap-6 border-b border-bone/10 py-2 text-sm">
                      <span>
                        {day.day}
                        {status.weekday === day.short ? " · Today" : ""}
                      </span>
                      <span>{formatRange(day.open, day.close)}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="type-label text-concrete">Follow</dt>
              <dd className="mt-4">
                <SocialLinks />
              </dd>
            </div>
          </dl>
        </div>

        <div className="min-h-[360px] border-t border-bone/15 lg:col-span-7 lg:min-h-[640px] lg:border-t-0 lg:border-l lg:border-bone/15">
          <iframe
            title={`Map of ${addressLine}`}
            src={mapEmbedUrl}
            className="h-full min-h-[360px] w-full grayscale invert contrast-[1.05] lg:min-h-[640px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
