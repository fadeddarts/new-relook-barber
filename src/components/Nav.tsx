import { useEffect, useState } from "react"
import { brand, navLinks } from "../data"
import { boardHref, bookHref, homeHref } from "../lib/route"
import { useActiveSection } from "../lib/useActiveSection"
import { trapFocus } from "../lib/focusTrap"
import { Mark } from "./Mark"
import { SocialLinks } from "./SocialLinks"
import { ThemeToggle } from "./ThemeToggle"

export function Nav({ standalone = false }: { standalone?: boolean }) {
  const active = useActiveSection()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const node = document.getElementById("mobile-menu")
    if (!node) return
    return trapFocus(node, () => setOpen(false))
  }, [open])

  function sectionHref(id: string) {
    return standalone ? homeHref(id) : `#${id}`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-bone/15 bg-ink text-bone">
      <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-5 md:px-10">
        <a href={standalone ? homeHref() : "#top"} className="flex min-w-0 items-center gap-2">
          <Mark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
          <span className="type-label hidden text-[0.95rem] tracking-[0.14em] whitespace-nowrap lg:inline">
            {brand.wordmark}
          </span>
        </a>

        <nav className="hidden items-center gap-7 min-[1100px]:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={sectionHref(link.id)}
              aria-current={!standalone && active === link.id ? "page" : undefined}
              className={`type-label transition-colors duration-200 hover:text-bone ${
                !standalone && active === link.id ? "text-bone underline decoration-gold decoration-2 underline-offset-8" : "text-bone/50"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SocialLinks compact className="hidden min-[1100px]:flex" />
          <ThemeToggle />
          <a
            href={boardHref()}
            className="type-label hidden min-h-11 items-center px-2 text-bone/50 transition-colors duration-200 hover:text-bone sm:inline-flex"
          >
            <span className="md:hidden">Staff</span>
            <span className="hidden md:inline">Staff login</span>
          </a>
          <a href={bookHref()} className="type-button hidden min-h-11 items-center bg-gold px-4 text-ink lg:inline-flex">
            Book now
          </a>
          <a href={bookHref()} className="type-button inline-flex min-h-11 items-center bg-gold px-3 text-ink lg:hidden">
            Book
          </a>
          <button
            type="button"
            className="type-label inline-grid min-h-11 min-w-[4.5rem] place-items-center px-2 min-[1100px]:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="invisible col-start-1 row-start-1">Close</span>
            <span className="col-start-1 row-start-1">{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[60] flex flex-col bg-ink text-bone">
          <div className="mx-auto flex h-[4.25rem] w-full max-w-[1440px] items-center justify-between gap-3 border-b border-bone/20 px-4 sm:gap-4 sm:px-5 md:px-10">
            <p className="flex min-w-0 items-center gap-2">
              <Mark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
              <span className="type-label hidden text-[0.95rem] tracking-[0.14em] whitespace-nowrap lg:inline">
                {brand.wordmark}
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <a
                href={boardHref()}
                className="type-label hidden min-h-11 items-center px-2 text-bone/50 transition-colors duration-200 hover:text-bone sm:inline-flex"
              >
                <span className="md:hidden">Staff</span>
                <span className="hidden md:inline">Staff login</span>
              </a>
              <a href={bookHref()} className="type-button hidden min-h-11 items-center bg-gold px-4 text-ink lg:inline-flex">
                Book now
              </a>
              <a href={bookHref()} className="type-button inline-flex min-h-11 items-center bg-gold px-3 text-ink lg:hidden">
                Book
              </a>
              <button
                type="button"
                className="type-label inline-grid min-h-11 min-w-[4.5rem] place-items-center px-2"
                onClick={() => setOpen(false)}
              >
                <span className="invisible col-start-1 row-start-1">Close</span>
                <span className="col-start-1 row-start-1">Close</span>
              </button>
            </div>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-5" aria-label="Mobile">
            {navLinks.map((link, index) => (
              <a
                key={link.id}
                href={sectionHref(link.id)}
                onClick={() => setOpen(false)}
                className="type-section border-b border-bone/15 py-3"
              >
                <span className="mr-4 text-gold">{String(index + 1).padStart(2, "0")}</span>
                {link.label}
              </a>
            ))}
            <a href={boardHref()} onClick={() => setOpen(false)} className="type-section border-b border-bone/15 py-3">
              <span className="mr-4 text-gold">{String(navLinks.length + 1).padStart(2, "0")}</span>
              Staff login
            </a>
          </nav>
          <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-8">
            <SocialLinks compact />
            <ThemeToggle />
            <a href={bookHref()} className="type-button inline-flex min-h-14 flex-1 items-center justify-center bg-gold text-ink">
              Book now
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
