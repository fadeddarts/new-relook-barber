import { socials, type SocialId } from "../data/shop"

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 shrink-0 fill-current">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11.25 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 shrink-0 fill-current">
      <path d="M14.5 3c.4 2.6 1.9 4.4 4.5 4.7v3.1c-1.5 0-2.9-.5-4.1-1.3v6.3A6.2 6.2 0 1 1 11 9.7v3.2a3.1 3.1 0 1 0 2.2 3V3z" />
    </svg>
  )
}

const icons = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
}

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {socials.map((social) => {
        const Icon = icons[social.id]
        return (
          <li key={social.id}>
            <a
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="type-button inline-flex min-h-14 items-center gap-3 border border-bone/30 bg-bone/5 px-5 text-bone transition-colors duration-200 hover:border-gold hover:bg-gold hover:text-ink"
            >
              <Icon />
              {social.label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function SocialLink({
  id,
  href,
  children,
}: {
  id: SocialId
  href: string
  children: string
}) {
  const Icon = icons[id]
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="type-button inline-flex min-h-14 items-center gap-3 border border-bone/30 bg-bone/5 px-5 text-bone transition-colors duration-200 hover:border-gold hover:bg-gold hover:text-ink"
    >
      <Icon />
      {children}
    </a>
  )
}
