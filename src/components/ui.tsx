import { useReducedMotion, motion } from "framer-motion"
import type { ReactNode } from "react"
import { bookHref } from "../lib/route"

const ease = [0.16, 1, 0.3, 1] as const

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function Frame({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: "inset(8% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease }}
    >
      {children}
    </motion.div>
  )
}

const buttonStyles = {
  gold: "bg-gold text-ink hover:bg-bone",
  ink: "bg-bone text-ink hover:bg-gold",
  line: "border border-current bg-transparent hover:border-gold hover:bg-gold hover:text-ink",
}

export function BookButton({
  children,
  service,
  variant = "gold",
  className = "",
}: {
  children: ReactNode
  service?: string
  variant?: keyof typeof buttonStyles
  className?: string
}) {
  return (
    <a
      href={bookHref(service)}
      className={`type-button inline-flex min-h-12 items-center justify-center px-5 transition-colors duration-200 ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </a>
  )
}
