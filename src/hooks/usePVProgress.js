import { useEffect, useState } from 'react'

const KEY = 'prime-video-rebuild-progress-v1'
const EVT = 'pv-progress-change'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function usePVProgress() {
  const [map, setMap] = useState(() => read())

  useEffect(() => {
    function sync() {
      setMap(read())
    }
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  function saveProgress(id, positionSeconds, durationSeconds) {
    if (!durationSeconds || durationSeconds <= 0) return
    const pct = Math.min(100, Math.round((positionSeconds / durationSeconds) * 100))
    const next = { ...map, [id]: { positionSeconds, durationSeconds, pct, updatedAt: Date.now() } }
    localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(EVT))
  }

  function getProgress(id) {
    return map[id] || null
  }

  function clearProgress() {
    localStorage.removeItem(KEY)
    window.dispatchEvent(new Event(EVT))
  }

  return { map, saveProgress, getProgress, clearProgress }
}

export function getProgressMap() {
  return read()
}
