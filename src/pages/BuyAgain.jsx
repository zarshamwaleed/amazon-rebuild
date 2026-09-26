import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import Button from '../components/Button'

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
        icon={RotateCcw}
        title="Sign in to see your Buy Again items"
        message="Products you've purchased will appear here."
        action={
          <Link to="/login">
            <Button size="sm">Sign in</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <p className="text-label mb-1.5 flex items-center gap-1.5 text-brass-600">
          <RotateCcw className="w-3.5 h-3.5" /> Order again
        </p>
        <h1 className="heading-page">Buy Again</h1>
        <p className="text-body-sm mt-1.5">Items you&apos;ve purchased before.</p>
      </div>

      {loading ? (
        <LoadingSkeleton cols={4} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="Nothing to buy again yet"
          message="Place your first order and it'll appear here."
        />
      ) : (
        <ProductGrid products={products} cols={4} />
      )}
    </div>
  )
}
