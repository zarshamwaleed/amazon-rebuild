import PVHero from '../../components/prime-video/PVHero'
import VideoRow from '../../components/prime-video/VideoRow'
import {
  TITLES,
  getFeatured,
  getPopularMovies,
  getOriginals,
  getFreeWithAds,
  getTitleById,
} from '../../data/prime-video/catalog'
import { getProgressMap } from '../../hooks/usePVProgress'

export default function PVHome() {
  const featured = getFeatured()
  const popular = getPopularMovies()
  const originals = getOriginals()
  const free = getFreeWithAds()
  const progress = getProgressMap()

  // Continue Watching — items with progress
  const continueWatching = Object.entries(progress)
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .map(([id]) => getTitleById(id))
    .filter(Boolean)
    .slice(0, 8)

  const progressMap = Object.fromEntries(
    Object.entries(progress).map(([id, p]) => [id, p.pct])
  )

  const editorsPicks = TITLES.filter(
    (t) => t.id !== featured.id && ['Drama', 'Mystery', 'Thriller'].some((g) => t.genres.includes(g))
  ).slice(0, 8)

  return (
    <div className="animate-fade-in">
      <PVHero title={featured} />

      {continueWatching.length > 0 && (
        <VideoRow
          heading="Continue Watching"
          titles={continueWatching}
          progressMap={progressMap}
          seeMoreTo="/prime-video/my-stuff"
        />
      )}

      <VideoRow heading="Editor's Picks" titles={editorsPicks} />
      <VideoRow heading="Avenzo Originals" titles={originals} />
      <VideoRow heading="Popular on Avenzo Studio" titles={popular} seeMoreTo="/prime-video/movies" />
      <VideoRow heading="Free to Watch" titles={free} seeMoreTo="/prime-video/movies" />
    </div>
  )
}
