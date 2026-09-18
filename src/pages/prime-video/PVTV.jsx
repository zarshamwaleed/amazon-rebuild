import VideoRow from '../../components/prime-video/VideoRow'
import { TITLES, getTVShows } from '../../data/prime-video/catalog'

export default function PVTV() {
  const shows = getTVShows()
  const drama = TITLES.filter((t) => t.genres.includes('Drama') && t.duration.startsWith('S'))

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">TV Shows</h1>
      <VideoRow heading="Prime Original Series" titles={shows} />
      {drama.length > 0 && <VideoRow heading="Drama" titles={drama} />}
      <VideoRow heading="All Series" titles={shows} />
    </div>
  )
}
