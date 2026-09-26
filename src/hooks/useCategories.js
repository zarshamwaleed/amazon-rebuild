import { useEffect, useState } from 'react'
import { getAllCategories } from '../services/categoryService'

export default function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAllCategories()
      .then((data) => {
        if (!cancelled) setCategories(data || [])
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading }
}
