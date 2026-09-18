import VideoRow from '../../components/prime-video/VideoRow'
import { TITLES, getPopularMovies, getFreeWithAds } from '../../data/prime-video/catalog'

export default function PVMovies() {
  const all = TITLES.filter((t) => !t.duration.startsWith('S'))
  const byGenre = (g) => all.filter((t) => t.genres.includes(g))
  const popular = getPopularMovies()
  const free = getFreeWithAds()

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Movies</h1>
      <VideoRow heading="Featured" titles={popular.slice(0, 6)} />
      <VideoRow heading="Action" titles={byGenre('Action')} />
      <VideoRow heading="Sci-Fi" titles={byGenre('Sci-Fi')} />
      <VideoRow heading="Drama" titles={byGenre('Drama')} />
      <VideoRow heading="Adventure" titles={byGenre('Adventure')} />
      <VideoRow heading="Free with Ads" titles={free} />
    </div>
  )
}
