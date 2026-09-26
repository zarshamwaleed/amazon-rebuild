import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import VideoCard from './VideoCard'

export default function VideoRow({ heading, titles = [], seeMoreTo, progressMap = {} }) {
  const ref = useRef(null)
  const [hovering, setHovering] = useState(false)

  function scrollBy(dir) {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir * 600, behavior: 'smooth' })
  }

  if (!titles.length) return null

  return (
    <section className="mb-14 relative" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl text-[var(--bone)]">{heading}</h2>
        {seeMoreTo && (
          <Link
            to={seeMoreTo}
            className="text-[13px] text-[var(--brass)] hover:underline underline-offset-4 transition-avenzo"
          >
            See more →
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className={
            'hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full items-center justify-center bg-[var(--ink)]/70 backdrop-blur border border-[var(--border)] text-[var(--bone)] transition-avenzo hover:text-[var(--brass)] hover:border-[var(--brass)] ' +
            (hovering ? 'opacity-100' : 'opacity-0 pointer-events-none')
          }
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className={
            'hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full items-center justify-center bg-[var(--ink)]/70 backdrop-blur border border-[var(--border)] text-[var(--bone)] transition-avenzo hover:text-[var(--brass)] hover:border-[var(--brass)] ' +
            (hovering ? 'opacity-100' : 'opacity-0 pointer-events-none')
          }
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={ref}
          className="pv-fade-x flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
        >
          {titles.map((t) => (
            <VideoCard key={t.id} title={t} progress={progressMap[t.id]} />
          ))}
        </div>
      </div>
    </section>
  )
}
