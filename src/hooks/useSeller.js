import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSellerProfile } from '../services/sellerService'

export function useSeller() {
  const { user, loading: authLoading } = useAuth()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setSeller(null)
      setLoading(false)
      return
    }
    let cancelled = false
    getSellerProfile(user.id)
      .then((p) => {
        if (!cancelled) setSeller(p)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  return { seller, isSeller: !!seller, loading }
}