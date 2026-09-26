import { useState } from 'react'
import VideoRow from '../../components/prime-video/VideoRow'
import { getTitleById } from '../../data/prime-video/catalog'
import { usePVWatchlist } from '../../hooks/usePVWatchlist'
import { getProgressMap } from '../../hooks/usePVProgress'

function PVEmptyState({ title, message }) {
  return (
    <div className="text-center py-20 px-6 border border-dashed border-[var(--border)] rounded-xl">
      <h3 className="font-display italic text-2xl text-[var(--bone)] mb-2">{title}</h3>
      {message && <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">{message}</p>}
    </div>
  )
}

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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bone)] mb-2">My Stuff</h1>
        <p className="text-[15px] text-[var(--muted)]">Everything you're watching, saving, and picking up again.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-avenzo ' +
              (tab === t.id
                ? 'bg-[var(--brass)] text-[var(--ink)]'
                : 'border border-[var(--bone)]/15 text-[var(--muted)] hover:text-[var(--bone)] hover:border-[var(--bone)]/30')
            }
          >
            {t.label} {t.count > 0 && '(' + t.count + ')'}
          </button>
        ))}
      </div>

      <div key={tab} className="tab-fade">
        {tab === 'watchlist' &&
          (watchlistTitles.length === 0 ? (
            <PVEmptyState title="Your watchlist is empty" message="Add titles to your watchlist from any video card." />
          ) : (
            <VideoRow heading="Saved Titles" titles={watchlistTitles} />
          ))}

        {tab === 'continue' &&
          (continueWatching.length === 0 ? (
            <PVEmptyState title="Nothing to continue" message="Start watching something and it will appear here." />
          ) : (
            <VideoRow heading="Pick up where you left off" titles={continueWatching} progressMap={progressMap} />
          ))}

        {tab === 'purchases' && (
          <PVEmptyState title="No purchases yet" message="Rentals and purchases will show up here." />
        )}
      </div>
    </div>
  )
}
