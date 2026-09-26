import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Plus,
  Check,
} from 'lucide-react'
import { getTitleById, getRecommendationsFor } from '../../data/prime-video/catalog'
import VideoRow from '../../components/prime-video/VideoRow'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'
import { usePVProgress } from '../../hooks/usePVProgress'

function fmt(t) {
  if (!isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60).toString().padStart(2, '0')
  return m + ':' + s
}

export default function PVWatch() {
  const { id } = useParams()
  const title = getTitleById(id)
  const videoRef = useRef(null)
  const { isInWatchlist, toggleWatchlist } = usePVWatchlist()
  const { saveProgress, getProgress } = usePVProgress()

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const savedProgress = getProgress(id)

  // Restore saved position when metadata loads
  useEffect(() => {
    const v = videoRef.current
    if (!v || !title) return
    function onLoaded() {
      setDuration(v.duration)
      if (savedProgress?.positionSeconds && savedProgress.positionSeconds < v.duration - 3) {
        v.currentTime = savedProgress.positionSeconds
      }
    }
    v.addEventListener('loadedmetadata', onLoaded)
    return () => v.removeEventListener('loadedmetadata', onLoaded)
  }, [id, title, savedProgress])

  // Save progress every 5 seconds
  useEffect(() => {
    const v = videoRef.current
    if (!v || !title) return
    const t = setInterval(() => {
      if (v && !v.paused && v.duration > 0) {
        saveProgress(title.id, v.currentTime, v.duration)
      }
    }, 5000)
    return () => clearInterval(t)
  }, [title, saveProgress])

  // Save on unmount
  useEffect(() => {
    const v = videoRef.current
    return () => {
      if (v && title && v.duration > 0) {
        saveProgress(title.id, v.currentTime, v.duration)
      }
    }
  }, [title, saveProgress])

  if (!title) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display italic text-2xl text-[var(--bone)] mb-2">Title not found</h2>
        <p className="text-sm text-[var(--muted)] mb-4">This video does not exist.</p>
        <Link to="/prime-video" className="text-sm text-[var(--brass)] hover:underline underline-offset-4">
          ← Back to Prime Video
        </Link>
      </div>
    )
  }

  const inList = isInWatchlist(title.id)
  const recs = getRecommendationsFor(title.id, 4)

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  function seek(delta) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta))
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function toggleFullscreen() {
    const v = videoRef.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div className="animate-fade-in">
      {/* Player */}
      <div className="relative bg-[var(--surface)] rounded-lg overflow-hidden mb-8 aspect-video">
        <video
          ref={videoRef}
          src={title.videoUrl}
          poster={title.backdrop}
          className="w-full h-full"
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          muted={muted}
          playsInline
        />

        {/* Overlay controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--ink)]/90 to-transparent p-4">
          <div
            className="group/scrub h-1 hover:h-1.5 bg-[var(--bone)]/20 rounded mb-3 cursor-pointer transition-all duration-fast"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const p = (e.clientX - rect.left) / rect.width
              if (videoRef.current && videoRef.current.duration) {
                videoRef.current.currentTime = p * videoRef.current.duration
              }
            }}
          >
            <div className="h-full bg-[var(--brass)] rounded transition-[width] duration-fast" style={{ width: pct + '%' }} />
          </div>

          <div className="flex items-center gap-4 text-[var(--bone)]">
            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              className="transition-avenzo hover:text-[var(--brass)] hover:scale-110"
            >
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={() => seek(-10)}
              aria-label="Rewind 10 seconds"
              className="transition-avenzo hover:text-[var(--brass)] hover:scale-110"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => seek(10)}
              aria-label="Forward 10 seconds"
              className="transition-avenzo hover:text-[var(--brass)] hover:scale-110"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="transition-avenzo hover:text-[var(--brass)] hover:scale-110"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-xs text-[var(--muted)]">
              {fmt(current)} / {fmt(duration)}
            </span>
            <button
              onClick={toggleFullscreen}
              className="ml-auto transition-avenzo hover:text-[var(--brass)] hover:scale-110"
              aria-label="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Title info */}
      <div className="mb-10 max-w-3xl">
        <h1 className="font-display text-4xl text-[var(--bone)] mb-3">{title.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)] mb-4">
          <span>{title.year}</span>
          <span className="opacity-40">·</span>
          <span className="border border-[var(--border)] px-1.5 py-0.5 text-xs rounded">{title.rating}</span>
          <span className="opacity-40">·</span>
          <span>{title.duration}</span>
          <span className="opacity-40">·</span>
          <span>{title.genres.join(', ')}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-[var(--bone)]/80 mb-6">{title.description}</p>
        <button
          onClick={() => toggleWatchlist(title.id)}
          className={
            'px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium border transition-avenzo ' +
            (inList
              ? 'bg-[var(--brass)]/10 border-[var(--brass)] text-[var(--brass)]'
              : 'border-[var(--bone)]/20 text-[var(--bone)] hover:border-[var(--brass)] hover:text-[var(--brass)]')
          }
        >
          {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {inList ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
      </div>

      {/* Recommendations */}
      {recs.length > 0 && <VideoRow heading={'Because you watched ' + title.title} titles={recs} />}

      <div className="mt-8">
        <Link to="/prime-video" className="text-sm text-[var(--brass)] hover:underline underline-offset-4 transition-avenzo">
          ← Back to Prime Video
        </Link>
      </div>
    </div>
  )
}
