import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  getCartItems,
  upsertCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartDB,
} from '../services/cartService'

const CartContext = createContext(null)
const STORAGE_KEY = 'amazon-rebuild-cart-v1'

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const syncedFromGuest = useRef(false)

  // -------- Load cart when auth state settles --------
  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    async function load() {
      try {
        if (user) {
          // Signed-in: load from DB
          const dbItems = await getCartItems(user.id)

          // Merge guest cart once per sign-in
          if (!syncedFromGuest.current) {
            const raw = localStorage.getItem(STORAGE_KEY)
            const guest = raw ? JSON.parse(raw) : []
            if (guest.length) {
              for (const g of guest) {
                await upsertCartItem(user.id, g.product.id, g.quantity)
              }
              localStorage.removeItem(STORAGE_KEY)
              const merged = await getCartItems(user.id)
              if (!cancelled) setItems(merged)
            } else if (!cancelled) {
              setItems(dbItems)
            }
            syncedFromGuest.current = true
          } else if (!cancelled) {
            setItems(dbItems)
          }
        } else {
          // Guest: load from localStorage
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!cancelled) setItems(raw ? JSON.parse(raw) : [])
          syncedFromGuest.current = false
        }
      } catch (err) {
        console.warn('[cart] load failed:', err)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  // -------- Persist guest cart to localStorage --------
  useEffect(() => {
    if (authLoading || !ready) return
    if (user) return // no localStorage when signed in
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('[cart] persist failed:', err)
    }
  }, [items, ready, user, authLoading])

  // -------- Actions --------

  async function addItem(product, quantity = 1) {
    if (user) {
      const existing = items.find((i) => i.product.id === product.id)
      const next = Math.min((existing?.quantity || 0) + quantity, product.stock || 999)
      await upsertCartItem(user.id, product.id, next)
      setItems((prev) => {
        const found = prev.find((i) => i.product.id === product.id)
        if (found) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: next } : i))
        return [...prev, { product, quantity: next }]
      })
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id)
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 999) }
              : i
          )
        }
        return [...prev, { product, quantity }]
      })
    }
  }

  async function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeItem(productId)
    const item = items.find((i) => i.product.id === productId)
    const max = item?.product.stock || 999
    const clamped = Math.min(quantity, max)

    if (user) {
      await updateCartItemQuantity(user.id, productId, clamped)
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: clamped } : i))
    )
  }

  async function removeItem(productId) {
    if (user) {
      await removeCartItem(user.id, productId)
    }
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  async function clearCart() {
    if (user) {
      await clearCartDB(user.id)
    }
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  // -------- Derived --------

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
    [items]
  )

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0
    return subtotal >= 50 ? 0 : 5.99
  }, [subtotal])

  const tax = useMemo(() => +(subtotal * 0.08).toFixed(2), [subtotal])

  const total = useMemo(() => +(subtotal + shipping + tax).toFixed(2), [subtotal, shipping, tax])

  const value = {
    items,
    count,
    subtotal: +subtotal.toFixed(2),
    shipping: +shipping.toFixed(2),
    tax,
    total,
    ready,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
