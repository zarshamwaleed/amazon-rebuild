import { useEffect, useState } from 'react'

const KEY = 'amazon-rebuild-recently-viewed-v1'
const MAX = 12

export function useRecentlyViewed(currentId) {
  const [ids, setIds] = useState([])

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setIds(JSON.parse(raw))
    } catch {}
  }, [])

  // Track the current product
  useEffect(() => {
    if (!currentId) return
    setIds((prev) => {
      const next = [currentId, ...prev.filter((id) => id !== currentId)].slice(0, MAX)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [currentId])

  return ids
}

export function getRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
