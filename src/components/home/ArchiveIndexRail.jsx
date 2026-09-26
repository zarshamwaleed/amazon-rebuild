import { useEffect, useState } from 'react'

// Mirrors the "N° 00X" catalog numbering used as each section's eyebrow
// (Hero is 001 and isn't listed here since it's already in view on load).
const SECTIONS = [
  { id: 'section-collections', num: '02', label: 'Collections' },
  { id: 'section-edit', num: '03', label: 'The Edit' },
  { id: 'section-trending', num: '04', label: 'Trending' },
  { id: 'section-story', num: '05', label: 'Story' },
  { id: 'section-ledger', num: '06', label: 'Ledger' },
]

/**
 * The homepage's signature interaction: a fixed vertical index, in the
 * spirit of a magazine table of contents, that tracks which section is in
 * view and lets you jump to one. Desktop-only — on a page this editorial,
 * mobile scroll should stay uninterrupted by chrome.
 */
export default function ArchiveIndexRail() {
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target)
            if (idx !== -1) setActive(idx)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Page sections"
      className="hidden lg:flex fixed right-7 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-6"
    >
      <div className="absolute right-[3px] top-0 bottom-0 w-px bg-stone-300/60" aria-hidden="true" />
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => scrollToSection(s.id)}
          className="group relative flex items-center gap-3"
        >
          <span
            className={
              'font-mono text-[0.7rem] uppercase tracking-[0.12em] whitespace-nowrap transition-avenzo ' +
              (i === active
                ? 'opacity-100 translate-x-0 text-charcoal-800'
                : 'opacity-0 translate-x-1 text-charcoal-400 group-hover:opacity-100 group-hover:translate-x-0')
            }
          >
            {s.label}
          </span>
          <span
            className={
              'font-mono text-[0.7rem] w-5 text-right shrink-0 transition-avenzo ' +
              (i === active ? 'text-brass-600' : 'text-stone-400')
            }
          >
            {s.num}
          </span>
          <span
            className={
              'relative z-10 w-2 h-2 rounded-full border shrink-0 transition-avenzo ' +
              (i === active ? 'bg-brass-500 border-brass-500 scale-125' : 'bg-bone-50 border-stone-300')
            }
          />
        </button>
      ))}
    </nav>
  )
}
