import { Link } from 'react-router-dom'
import { Play, Plus, Check, Volume2, VolumeX, Share2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'

export default function PVHero({ title }) {
  const { isInWatchlist, toggleWatchlist } = usePVWatchlist()
  const inList = isInWatchlist(title.id)

  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  // Autoplay muted video in background
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [title.id])

  // Pause video when user scrolls away
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.2 }
    )
    obs.observe(v)
    return () => obs.disconnect()
  }, [])

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <section className="relative w-full h-[380px] md:h-[480px] lg:h-[540px] overflow-hidden -mx-4 rounded-lg">
      {/* Background video */}
      <video
        ref={videoRef}
        src={title.videoUrl}
        poster={title.backdrop}
        muted={muted}
        loop
        playsInline
        autoPlay
        onCanPlay={() => setVideoReady(true)}
        className={
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ' +
          (videoReady ? 'opacity-100' : 'opacity-0')
        }
      />
      {/* Poster shown while video loads */}
      {!videoReady && (
        <img
          src={title.backdrop}
          alt={title.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark gradient overlays for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F171E] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-[1500px] mx-auto h-full px-6 md:px-12 flex flex-col justify-end md:justify-center pb-8 md:pb-0">
        <div className="max-w-2xl">
          <p className="text-white text-sm font-semibold uppercase tracking-widest mb-2">
            prime original
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 drop-shadow-lg">
            {title.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200 mb-4">
            <span>NEW SERIES</span>
            <span>{title.year}</span>
            <span className="border border-gray-400 px-1.5 py-0.5 text-xs">{title.rating}</span>
            <span>{title.duration}</span>
            {title.genres.map((g) => (
              <span key={g} className="text-gray-300">{g}</span>
            ))}
          </div>

          <p className="text-sm md:text-base text-gray-100 mb-6 max-w-xl line-clamp-3 drop-shadow">
            {title.description}
          </p>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Link
              to={'/prime-video/watch/' + title.id}
              className="bg-white hover:bg-gray-200 text-black font-bold px-6 py-2.5 rounded flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-black" /> Watch now
            </Link>
            <button
              onClick={() => toggleWatchlist(title.id)}
              className="bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white px-4 py-2.5 rounded flex items-center gap-2"
              aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            <button
              className="bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white p-2.5 rounded"
              aria-label="Like"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              className="bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white p-2.5 rounded"
              aria-label="Dislike"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              className="bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white p-2.5 rounded"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mute toggle (bottom right like Prime Video) */}
      <button
        onClick={toggleMute}
        className="absolute bottom-8 right-6 z-20 w-11 h-11 rounded-full border-2 border-white/70 bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </section>
  )
}


