import { useMemo, useState } from 'react'
import VideoRow from '../../components/prime-video/VideoRow'
import VideoCard from '../../components/prime-video/VideoCard'
import { TITLES, getPopularMovies, getFreeWithAds } from '../../data/prime-video/catalog'

export default function PVMovies() {
  const all = useMemo(() => TITLES.filter((t) => !t.duration.startsWith('S')), [])
  const genres = useMemo(() => ['All', ...Array.from(new Set(all.flatMap((t) => t.genres)))], [all])
  const [genre, setGenre] = useState('All')

  const popular = getPopularMovies()
  const free = getFreeWithAds()
  const byGenre = (g) => all.filter((t) => t.genres.includes(g))
  const filtered = genre === 'All' ? [] : all.filter((t) => t.genres.includes(genre))

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bone)] mb-2">Movies</h1>
        <p className="text-[15px] text-[var(--muted)]">Feature films for every mood, curated by Avenzo Studio.</p>
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
          <VideoRow heading="Featured" titles={popular.slice(0, 8)} />
          <VideoRow heading="Action" titles={byGenre('Action')} />
          <VideoRow heading="Sci-Fi" titles={byGenre('Sci-Fi')} />
          <VideoRow heading="Drama" titles={byGenre('Drama')} />
          <VideoRow heading="Adventure" titles={byGenre('Adventure')} />
          <VideoRow heading="Free with Ads" titles={free} />
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
