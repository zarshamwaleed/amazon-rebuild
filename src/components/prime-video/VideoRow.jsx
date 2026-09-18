import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import VideoCard from './VideoCard'

export default function VideoRow({ heading, titles = [], seeMoreTo, progressMap = {} }) {
  const ref = useRef(null)

  function scrollBy(dir) {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir * 500, behavior: 'smooth' })
  }

  if (!titles.length) return null

  return (
    <section className="mb-10 relative">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white">{heading}</h2>
        {seeMoreTo && (
          <Link to={seeMoreTo} className="text-xs text-[#00A8E1] hover:underline">
            See more →
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2">
          {titles.map((t) => (
            <VideoCard key={t.id} title={t} progress={progressMap[t.id]} />
          ))}
        </div>
      </div>
    </section>
  )
}