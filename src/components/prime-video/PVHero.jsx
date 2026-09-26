import { Link } from 'react-router-dom'
import { Play, Plus, Check, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'

export default function PVHero({ title }) {
  const { isInWatchlist, toggleWatchlist } = usePVWatchlist()
  const inList = isInWatchlist(title.id)

  return (
    <section className="relative w-full h-[70vh] min-h-[460px] max-h-[720px] overflow-hidden rounded-xl mb-14">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={title.backdrop}
          alt=""
          className="pv-kenburns absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Legibility gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end md:items-center px-6 md:px-12 pb-10 md:pb-0">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brass)] mb-3">
            A Prime Original
          </p>
          <h1 className="font-display italic font-normal text-[42px] leading-[1.0] sm:text-6xl md:text-7xl text-[var(--bone)] mb-5">
            {title.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--muted)] mb-5">
            <span>{title.year}</span>
            <span className="opacity-40">·</span>
            <span className="border border-[var(--border)] rounded px-1.5 py-0.5 text-[11px]">{title.rating}</span>
            <span className="opacity-40">·</span>
            <span>{title.duration}</span>
            <span className="opacity-40">·</span>
            <span>{title.genres.join(', ')}</span>
          </div>

          <p className="text-[15px] leading-relaxed text-[var(--bone)]/80 max-w-[560px] mb-8 line-clamp-3">
            {title.description}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={'/prime-video/watch/' + title.id}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--bone)] text-[var(--ink)] text-sm font-semibold hover:scale-[1.03] transition-avenzo"
            >
              <Play className="w-4 h-4 fill-[var(--ink)]" /> Watch now
            </Link>

            <button
              onClick={() => toggleWatchlist(title.id)}
              className="w-11 h-11 rounded-full border border-[var(--bone)]/20 flex items-center justify-center text-[var(--bone)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-avenzo"
              aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            <button
              className="w-11 h-11 rounded-full border border-[var(--bone)]/20 flex items-center justify-center text-[var(--bone)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-avenzo"
              aria-label="Like"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              className="w-11 h-11 rounded-full border border-[var(--bone)]/20 flex items-center justify-center text-[var(--bone)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-avenzo"
              aria-label="Dislike"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              className="w-11 h-11 rounded-full border border-[var(--bone)]/20 flex items-center justify-center text-[var(--bone)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-avenzo"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
