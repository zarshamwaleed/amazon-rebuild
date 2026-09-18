import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getCouponsForProducts, computeDiscount } from '../services/couponService'
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
  const { pushToast } = useToast()
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [couponSavings, setCouponSavings] = useState(0)
  const [appliedCoupons, setAppliedCoupons] = useState([])
  const syncedFromGuest = useRef(false)

  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    async function load() {
      try {
        if (user) {
          const dbItems = await getCartItems(user.id)
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

  useEffect(() => {
    let cancelled = false
    async function calcCoupons() {
      try {
        if (!items.length) {
          if (!cancelled) {
            setCouponSavings(0)
            setAppliedCoupons([])
          }
          return
        }
        const productIds = items.map((i) => i.product.id)
        const couponMap = await getCouponsForProducts(productIds)

        // Read clipped IDs: from DB rows if user is signed in, else localStorage
        let clipped = []
        if (user) {
          const raw = await import('../services/supabase').then(({ supabase }) =>
            supabase.from('user_coupons').select('coupon_id').eq('user_id', user.id)
          )
          clipped = (raw.data || []).map((r) => r.coupon_id)
        } else {
          try {
            clipped = JSON.parse(
              localStorage.getItem('amazon-rebuild-clipped-coupons-v1') || '[]'
            )
          } catch {}
        }

        let totalSavings = 0
        const applied = []
        for (const item of items) {
          const coupons = couponMap[item.product.id] || []
          for (const c of coupons) {
            if (!clipped.includes(c.id)) continue
            const perUnit = computeDiscount(c, item.product)
            const lineSavings = perUnit * item.quantity
            totalSavings += lineSavings
            applied.push({ coupon: c, product: item.product, savings: lineSavings })
          }
        }
        if (!cancelled) {
          setCouponSavings(+totalSavings.toFixed(2))
          setAppliedCoupons(applied)
        }
      } catch (err) {
        console.warn('[cart] coupon calc failed:', err)
      }
    }
    calcCoupons()
    return () => {
      cancelled = true
    }
  }, [items, user])

  useEffect(() => {
    if (authLoading || !ready) return
    if (user) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('[cart] persist failed:', err)
    }
  }, [items, ready, user, authLoading])

async function addItem(product, quantity = 1, options = {}) {
  const { registryId = null, registryItemId = null } = options || {}
  try {
    if (user) {
      const existing = items.find((i) => i.product.id === product.id)
      const next = Math.min((existing?.quantity || 0) + quantity, product.stock || 999)
      await upsertCartItem(user.id, product.id, next)
      setItems((prev) => {
        const found = prev.find((i) => i.product.id === product.id)
        if (found) {
          return prev.map((i) =>
            i.product.id === product.id
              ? {
                  ...i,
                  quantity: next,
                  // preserve the registry link if provided
                  registryId: registryId || i.registryId,
                  registryItemId: registryItemId || i.registryItemId,
                }
              : i
          )
        }
        return [
          ...prev,
          { product, quantity: next, registryId, registryItemId },
        ]
      })
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id)
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? {
                  ...i,
                  quantity: Math.min(i.quantity + quantity, product.stock || 999),
                  registryId: registryId || i.registryId,
                  registryItemId: registryItemId || i.registryItemId,
                }
              : i
          )
        }
        return [...prev, { product, quantity, registryId, registryItemId }]
      })
    }
    pushToast('Added to cart', { type: 'success' })
  } catch (err) {
    pushToast('Could not add to cart', { type: 'error' })
    throw err
  }
}

  async function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeItem(productId)
    const item = items.find((i) => i.product.id === productId)
    const max = item?.product.stock || 999
    const clamped = Math.min(quantity, max)
    try {
      if (user) await updateCartItemQuantity(user.id, productId, clamped)
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: clamped } : i))
      )
    } catch (err) {
      pushToast('Could not update quantity', { type: 'error' })
    }
  }

  async function removeItem(productId) {
    try {
      if (user) await removeCartItem(user.id, productId)
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
      pushToast('Removed from cart', { type: 'info' })
    } catch (err) {
      pushToast('Could not remove item', { type: 'error' })
    }
  }

  async function clearCart() {
    try {
      if (user) await clearCartDB(user.id)
      setItems([])
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
    } catch (err) {
      pushToast('Could not clear cart', { type: 'error' })
    }
  }

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
  const total = useMemo(
    () => Math.max(0, +(subtotal + shipping + tax - couponSavings).toFixed(2)),
    [subtotal, shipping, tax, couponSavings]
  )

  const value = {
    items,
    count,
    subtotal: +subtotal.toFixed(2),
    shipping: +shipping.toFixed(2),
    tax,
    couponSavings,
    appliedCoupons,
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