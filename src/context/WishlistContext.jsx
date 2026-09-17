import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  getUserWishlist,
  addToWishlistDB,
  removeFromWishlistDB,
} from '../services/wishlistService'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'amazon-rebuild-wishlist-v1'

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState([]) // { product, id? } — id only when DB-backed
  const [ready, setReady] = useState(false)

  // Load wishlist when auth settles
  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    async function load() {
      try {
        if (user) {
          const data = await getUserWishlist(user.id)
          if (!cancelled) setItems(data)
        } else {
          const raw = localStorage.getItem(STORAGE_KEY)
          const guests = raw ? JSON.parse(raw) : []
          if (!cancelled) setItems(guests)
        }
      } catch (err) {
        console.warn('[wishlist] load failed:', err)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  // Persist guest wishlist
  useEffect(() => {
    if (!ready || user || authLoading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, ready, user, authLoading])

  function isWishlisted(productId) {
    return items.some((i) => i.product.id === productId)
  }

  async function toggleWishlist(product) {
    const exists = isWishlisted(product.id)
    if (user) {
      if (exists) {
        await removeFromWishlistDB(user.id, product.id)
      } else {
        await addToWishlistDB(user.id, product.id)
      }
      const fresh = await getUserWishlist(user.id)
      setItems(fresh)
    } else {
      setItems((prev) => {
        if (exists) return prev.filter((i) => i.product.id !== product.id)
        return [{ product }, ...prev]
      })
    }
  }

  async function removeFromWishlist(productId) {
    if (user) {
      await removeFromWishlistDB(user.id, productId)
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    } else {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    }
  }

  const count = items.length

  const value = {
    items,
    count,
    ready,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
