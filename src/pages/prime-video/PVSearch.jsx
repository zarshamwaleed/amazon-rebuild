import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import VideoRow from '../../components/prime-video/VideoRow'
import { searchTitles } from '../../data/prime-video/catalog'

export default function PVSearch() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const [value, setValue] = useState(q)

  useEffect(() => setValue(q), [q])

  const results = useMemo(() => searchTitles(q), [q])
  const movies = results.filter((t) => !t.duration.startsWith('S'))
  const shows = results.filter((t) => t.duration.startsWith('S'))

  function submit(e) {
    e.preventDefault()
    navigate(value.trim() ? '/prime-video/search?q=' + encodeURIComponent(value.trim()) : '/prime-video/search')
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={submit} className="max-w-2xl mx-auto text-center mb-14">
        <div className="flex items-center justify-center gap-3 border-b-2 border-[var(--bone)]/15 focus-within:border-[var(--brass)] transition-avenzo pb-3">
          <Search className="w-5 h-5 text-[var(--muted)] flex-shrink-0" />
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search movies, shows, genres…"
            className="w-full bg-transparent text-center font-sans text-base sm:text-lg text-[var(--bone)] placeholder:font-display placeholder:italic placeholder:text-2xl sm:placeholder:text-3xl placeholder:text-[var(--muted)]/70 focus:outline-none"
          />
        </div>
      </form>

      {!q && (
        <div className="text-center py-16">
          <h2 className="font-display italic text-2xl text-[var(--bone)] mb-2">Start typing to search</h2>
          <p className="text-sm text-[var(--muted)]">Find movies and shows across Avenzo Studio.</p>
        </div>
      )}

      {q && results.length === 0 && (
        <div className="text-center py-16">
          <h2 className="font-display italic text-2xl text-[var(--bone)] mb-2">No titles found</h2>
          <p className="text-sm text-[var(--muted)] mb-4">Try a different title, genre, or keyword.</p>
          <button
            onClick={() => navigate('/prime-video/search')}
            className="text-sm text-[var(--brass)] hover:underline underline-offset-4 transition-avenzo"
          >
            Clear search
          </button>
        </div>
      )}

      {q && results.length > 0 && (
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-6">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
        </p>
      )}

      {q && movies.length > 0 && <VideoRow heading="Movies" titles={movies} />}
      {q && shows.length > 0 && <VideoRow heading="TV Shows" titles={shows} />}
    </div>
  )
}
