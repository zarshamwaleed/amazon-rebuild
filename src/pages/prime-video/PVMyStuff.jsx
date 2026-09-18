import { useState } from 'react'
import { Link } from 'react-router-dom'
import VideoRow from '../../components/prime-video/VideoRow'
import { TITLES, getTitleById } from '../../data/prime-video/catalog'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'
import { getProgressMap } from '../../hooks/usePVProgress'
import EmptyState from '../../components/EmptyState'

export default function PVMyStuff() {
  const [tab, setTab] = useState('watchlist')
  const { ids } = usePVWatchlist()
  const progress = getProgressMap()

  const watchlistTitles = ids.map(getTitleById).filter(Boolean)
  const continueWatching = Object.entries(progress)
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .map(([id]) => getTitleById(id))
    .filter(Boolean)

  const progressMap = Object.fromEntries(
    Object.entries(progress).map(([id, p]) => [id, p.pct])
  )

  const TABS = [
    { id: 'watchlist', label: 'Watchlist', count: watchlistTitles.length },
    { id: 'continue', label: 'Continue Watching', count: continueWatching.length },
    { id: 'purchases', label: 'Purchases', count: 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">My Stuff</h1>

      <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition border-b-2 ' +
              (tab === t.id
                ? 'border-[#00A8E1] text-white'
                : 'border-transparent text-gray-400 hover:text-white')
            }
          >
            {t.label} {t.count > 0 && <span className="text-xs">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === 'watchlist' && (
        watchlistTitles.length === 0 ? (
          <EmptyState
            title="Your watchlist is empty"
            message="Add titles to your watchlist from any video card."
          />
        ) : (
          <VideoRow heading="Saved Titles" titles={watchlistTitles} />
        )
      )}

      {tab === 'continue' && (
        continueWatching.length === 0 ? (
          <EmptyState
            title="Nothing to continue"
            message="Start watching something and it will appear here."
          />
        ) : (
          <VideoRow heading="Pick up where you left off" titles={continueWatching} progressMap={progressMap} />
        )
      )}

      {tab === 'purchases' && (
        <EmptyState
          title="No purchases yet"
          message="Rentals and purchases will show up here."
        />
      )}
    </div>
  )
}
