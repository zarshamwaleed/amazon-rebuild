import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'amazon-rebuild-cart-v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch (err) {
      console.warn('[cart] Failed to load cart:', err)
    }
    setReady(true)
  }, [])

  // Persist on change (skip the very first render)
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('[cart] Failed to save cart:', err)
    }
  }, [items, ready])

  function addItem(product, quantity = 1) {
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

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeItem(productId)
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(quantity, i.product.stock || 999) }
          : i
      )
    )
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    [items]
  )

  const value = {
    items,
    count,
    subtotal,
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
