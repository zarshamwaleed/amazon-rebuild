import { useSearchParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import VideoRow from '../../components/prime-video/VideoRow'
import { searchTitles } from '../../data/prime-video/catalog'
import EmptyState from '../../components/EmptyState'

export default function PVSearch() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const results = useMemo(() => searchTitles(q), [q])

  const movies = results.filter((t) => !t.duration.startsWith('S'))
  const shows = results.filter((t) => t.duration.startsWith('S'))

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">
        {q ? 'Results for "' + q + '"' : 'Search Prime Video'}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {results.length} result{results.length !== 1 ? 's' : ''}
      </p>

      {!q && (
        <EmptyState
          title="Start typing to search"
          message="Use the search icon in the header to find movies and shows."
        />
      )}

      {q && results.length === 0 && (
        <EmptyState
          title={'No results for "' + q + '"'}
          message="Try different keywords or browse our catalog."
        />
      )}

      {q && movies.length > 0 && <VideoRow heading="Movies" titles={movies} />}
      {q && shows.length > 0 && <VideoRow heading="TV Shows" titles={shows} />}
    </div>
  )
}
