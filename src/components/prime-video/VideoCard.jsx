import { Link } from 'react-router-dom'
import { Play, Plus, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'

export default function VideoCard({ title, progress }) {
  const { isInWatchlist, toggleWatchlist } = usePVWatchlist()
  const inList = isInWatchlist(title.id)

  const videoRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)

  // Autoplay muted preview on mount — pause when not in view
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { threshold: 0.25 }
    )
    obs.observe(v)
    return () => obs.disconnect()
  }, [])

  function handleWatchlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWatchlist(title.id)
  }

  return (
    <Link
      to={'/prime-video/watch/' + title.id}
      className="group relative block flex-shrink-0 w-44 sm:w-52"
    >
      <div className="aspect-[2/3] rounded overflow-hidden bg-[#1B2733] relative">
        {/* Poster shown while video loads */}
        <img
          src={title.poster}
          alt={title.title}
          className={
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ' +
            (videoReady ? 'opacity-0' : 'opacity-100')
          }
          loading="lazy"
        />

        {/* Autoplay looping preview video */}
        <video
          ref={videoRef}
          src={title.previewUrl || title.videoUrl}
          poster={title.poster}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          className={
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 ' +
            (videoReady ? 'opacity-100' : 'opacity-0')
          }
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <div className="flex gap-2 mb-2">
            <span className="bg-white text-black rounded-full p-1.5">
              <Play className="w-3.5 h-3.5 fill-black" />
            </span>
            <button
              onClick={handleWatchlist}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-full p-1.5"
              aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-gray-200 line-clamp-2">{title.description}</p>
        </div>

        {title.isFree && (
          <span className="absolute top-2 left-2 bg-[#00A8E1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            FREE WITH ADS
          </span>
        )}

        {progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-10">
            <div className="h-full bg-[#00A8E1]" style={{ width: progress + '%' }} />
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="text-sm font-medium text-white line-clamp-1">{title.title}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {title.year} · {title.duration}
        </div>
      </div>
    </Link>
  )
}
