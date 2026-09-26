import { Link } from 'react-router-dom'
import { Play, Plus, Check } from 'lucide-react'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'

export default function VideoCard({ title, progress, className = '' }) {
  const { isInWatchlist, toggleWatchlist } = usePVWatchlist()
  const inList = isInWatchlist(title.id)

  function handleWatchlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWatchlist(title.id)
  }

  const sizeClass = className || 'w-40 sm:w-48 flex-shrink-0'

  return (
    <Link to={'/prime-video/watch/' + title.id} className={'group relative block snap-start ' + sizeClass}>
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--surface)] relative">
        <img
          src={title.poster}
          alt={title.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-base flex flex-col justify-end p-3">
          <div className="flex items-center justify-center mb-2">
            <span className="w-12 h-12 rounded-full bg-[var(--bone)] flex items-center justify-center scale-90 group-hover:scale-100 transition-avenzo">
              <Play className="w-4 h-4 fill-[var(--ink)] text-[var(--ink)] translate-x-[1px]" />
            </span>
          </div>
          <p className="text-[13px] font-medium text-[var(--bone)] line-clamp-1">{title.title}</p>
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)] mt-0.5">
            {title.year} · {title.genres.slice(0, 2).join(' / ')}
          </p>
        </div>

        {/* Add to watchlist */}
        <button
          onClick={handleWatchlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur border border-[var(--border)] flex items-center justify-center text-[var(--bone)] opacity-0 group-hover:opacity-100 transition-avenzo hover:border-[var(--brass)] hover:text-[var(--brass)]"
          aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Prime / Free badge */}
        {(title.isPrime || title.isFree) && (
          <span
            className={
              'absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ' +
              (title.isFree
                ? 'bg-[var(--brass)] text-[var(--ink)]'
                : 'border border-[var(--brass)] text-[var(--brass)]')
            }
          >
            {title.isFree ? 'Free' : 'Prime'}
          </span>
        )}

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/40">
            <div className="h-full bg-[var(--brass)]" style={{ width: progress + '%' }} />
          </div>
        )}
      </div>
    </Link>
  )
}
