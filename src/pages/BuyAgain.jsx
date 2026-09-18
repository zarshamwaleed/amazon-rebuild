import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'

export default function BuyAgain() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    async function load() {
      // Get distinct product_ids from user's past order_items
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
      const ids = (orders || []).map((o) => o.id)
      if (!ids.length) {
        setLoading(false)
        return
      }
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id')
        .in('order_id', ids)
      const unique = [...new Set((items || []).map((i) => i.product_id))]
      if (!unique.length) {
        setLoading(false)
        return
      }
      const { data: prods } = await supabase.from('products').select('*').in('id', unique)
      setProducts(prods || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (!user) {
    return (
      <EmptyState
        title="Sign in to see your Buy Again items"
        message="Products you've purchased will appear here."
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Buy Again</h1>
      <p className="text-sm text-gray-600 mb-6">Items you've purchased before.</p>

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Nothing to buy again yet"
          message="Place your first order and it'll appear here."
        />
      ) : (
        <ProductGrid products={products} cols={4} />
      )}
    </div>
  )
}
