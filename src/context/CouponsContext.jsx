import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  getUserCoupons,
  clipCouponDB,
  unclipCouponDB,
} from '../services/couponService'

const CouponsContext = createContext(null)
const STORAGE_KEY = 'amazon-rebuild-clipped-coupons-v1'

export function CouponsProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [clippedIds, setClippedIds] = useState([])
  const [dbCoupons, setDbCoupons] = useState([])
  const [ready, setReady] = useState(false)

  // Load when auth settles
  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    async function load() {
      try {
        if (user) {
          const rows = await getUserCoupons(user.id)
          if (!cancelled) {
            setDbCoupons(rows)
            setClippedIds(rows.map((r) => r.coupon?.id).filter(Boolean))
          }
        } else {
          const raw = localStorage.getItem(STORAGE_KEY)
          const ids = raw ? JSON.parse(raw) : []
          if (!cancelled) {
            setClippedIds(ids)
            setDbCoupons([])
          }
        }
      } catch (err) {
        console.warn('[coupons] load failed:', err)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  // Persist guest clips
  useEffect(() => {
    if (!ready || user || authLoading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clippedIds))
    } catch {}
  }, [clippedIds, ready, user, authLoading])

  function isClipped(couponId) {
    return clippedIds.includes(couponId)
  }

  async function clipCoupon(couponId) {
    if (user) {
      await clipCouponDB(user.id, couponId)
      const rows = await getUserCoupons(user.id)
      setDbCoupons(rows)
      setClippedIds(rows.map((r) => r.coupon?.id).filter(Boolean))
    } else {
      setClippedIds((prev) => (prev.includes(couponId) ? prev : [...prev, couponId]))
    }
  }

  async function unclipCoupon(couponId) {
    if (user) {
      await unclipCouponDB(user.id, couponId)
      const rows = await getUserCoupons(user.id)
      setDbCoupons(rows)
      setClippedIds(rows.map((r) => r.coupon?.id).filter(Boolean))
    } else {
      setClippedIds((prev) => prev.filter((id) => id !== couponId))
    }
  }

  const count = clippedIds.length

  const value = {
    clippedIds,
    dbCoupons,
    count,
    ready,
    isClipped,
    clipCoupon,
    unclipCoupon,
  }

  return <CouponsContext.Provider value={value}>{children}</CouponsContext.Provider>
}

export function useCoupons() {
  const ctx = useContext(CouponsContext)
  if (!ctx) throw new Error('useCoupons must be used inside CouponsProvider')
  return ctx
}