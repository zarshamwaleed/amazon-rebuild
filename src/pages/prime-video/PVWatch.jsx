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
import EmptyState from '../../components/EmptyState'

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
    return <EmptyState title="Title not found" message="This video does not exist." />
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
    <div>
      {/* Player */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-6 aspect-video">
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="h-1 bg-white/30 rounded mb-3 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              if (videoRef.current && videoRef.current.duration) {
                videoRef.current.currentTime = pct * videoRef.current.duration
              }
            }}
          >
            <div className="h-full bg-[#00A8E1] rounded" style={{ width: pct + '%' }} />
          </div>

          <div className="flex items-center gap-3 text-white">
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={() => seek(-10)} aria-label="Rewind 10 seconds">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => seek(10)} aria-label="Forward 10 seconds">
              <RotateCw className="w-5 h-5" />
            </button>
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-xs text-gray-200">
              {fmt(current)} / {fmt(duration)}
            </span>
            <button onClick={toggleFullscreen} className="ml-auto" aria-label="Fullscreen">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Title info */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
          <span>{title.year}</span>
          <span className="border border-gray-600 px-1.5 py-0.5 text-xs">{title.rating}</span>
          <span>{title.duration}</span>
          {title.genres.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <p className="text-gray-200 mb-4 max-w-3xl">{title.description}</p>
        <button
          onClick={() => toggleWatchlist(title.id)}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded flex items-center gap-2 text-sm"
        >
          {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {inList ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <VideoRow heading={'Because you watched ' + title.title} titles={recs} />
      )}

      <div className="mt-6">
        <Link to="/prime-video" className="text-sm text-[#00A8E1] hover:underline">
          ← Back to Prime Video
        </Link>
      </div>
    </div>
  )
}
