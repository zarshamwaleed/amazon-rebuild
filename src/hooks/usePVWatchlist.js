import { useEffect, useState } from 'react'

const KEY = 'prime-video-rebuild-watchlist-v1'
const EVT = 'pv-watchlist-change'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function usePVWatchlist() {
  const [ids, setIds] = useState(() => read())

  useEffect(() => {
    function sync() {
      setIds(read())
    }
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  function isInWatchlist(id) {
    return ids.includes(id)
  }

  function toggleWatchlist(id) {
    const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
    localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(EVT))
  }

  function clearWatchlist() {
    localStorage.removeItem(KEY)
    window.dispatchEvent(new Event(EVT))
  }

  return { ids, isInWatchlist, toggleWatchlist, clearWatchlist }
}

export function getWatchlistIds() {
  return read()
}
