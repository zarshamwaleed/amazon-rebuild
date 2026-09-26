import { useMemo, useState } from 'react'
import VideoRow from '../../components/prime-video/VideoRow'
import VideoCard from '../../components/prime-video/VideoCard'
import { TITLES, getTVShows } from '../../data/prime-video/catalog'

export default function PVTV() {
  const shows = useMemo(() => getTVShows(), [])
  const genres = useMemo(() => ['All', ...Array.from(new Set(shows.flatMap((t) => t.genres)))], [shows])
  const [genre, setGenre] = useState('All')

  const drama = TITLES.filter((t) => t.genres.includes('Drama') && t.duration.startsWith('S'))
  const filtered = genre === 'All' ? [] : shows.filter((t) => t.genres.includes(genre))

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bone)] mb-2">TV Shows</h1>
        <p className="text-[15px] text-[var(--muted)]">Original series, one episode away from your next obsession.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={
              'px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-avenzo ' +
              (genre === g
                ? 'bg-[var(--brass)] text-[var(--ink)]'
                : 'border border-[var(--bone)]/15 text-[var(--muted)] hover:text-[var(--bone)] hover:border-[var(--bone)]/30')
            }
          >
            {g}
          </button>
        ))}
      </div>

      {genre === 'All' ? (
        <div key="all" className="tab-fade">
          <VideoRow heading="Avenzo Original Series" titles={shows} />
          {drama.length > 0 && <VideoRow heading="Drama" titles={drama} />}
          <VideoRow heading="All Series" titles={shows} />
        </div>
      ) : (
        <div key={genre} className="tab-fade grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((t) => (
            <VideoCard key={t.id} title={t} className="w-full" />
          ))}
        </div>
      )}
    </div>
  )
}
