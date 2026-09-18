import PVHero from '../../components/prime-video/PVHero'
import VideoRow from '../../components/prime-video/VideoRow'
import {
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

  return (
    <div>
      <PVHero title={featured} />

      {continueWatching.length > 0 && (
        <VideoRow
          heading="Continue Watching"
          titles={continueWatching}
          progressMap={progressMap}
          seeMoreTo="/prime-video/my-stuff"
        />
      )}

      <VideoRow heading="Popular Movies" titles={popular} seeMoreTo="/prime-video/movies" />
      <VideoRow heading="Amazon Originals" titles={originals} />
      <VideoRow heading="Free Movies & TV" titles={free} seeMoreTo="/prime-video/movies" />
    </div>
  )
}
