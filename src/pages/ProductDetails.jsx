import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Zap, Truck, ShieldCheck } from 'lucide-react'
import Rating from '../components/Rating'
import ProductGallery from '../components/ProductGallery'
import QuantitySelector from '../components/QuantitySelector'
import ReviewsList from '../components/ReviewsList'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import WishlistButton from '../components/WishlistButton'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import { supabase } from '../services/supabase'
import { getRecommendations } from '../services/recommendationService'
import { useCart } from '../context/CartContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  useRecentlyViewed(id)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        setProduct(null)
        setRelated([])
        setRecommendations([])
        setQuantity(1)

        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (err) throw err
        if (cancelled) return
        if (!data) {
          setError('not_found')
          setLoading(false)
          return
        }
        setProduct(data)

        if (data.category_id) {
          const { data: rel } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .order('rating', { ascending: false })
            .limit(4)
          if (!cancelled) setRelated(rel || [])
        }

        const recs = await getRecommendations(data, 4)
        if (!cancelled) setRecommendations(recs)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  function handleAddToCart() {
    if (!product) return
    addItem(product, quantity)

  }

  function handleBuyNow() {
    if (!product) return
    addItem(product, quantity)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-8 bg-gray-100 rounded w-1/4" />
          <div className="h-24 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <EmptyState
        title="Product not found"
        message="This product may have been removed or the link is incorrect."
      />
    )
  }
  if (error) {
    return <EmptyState title="Could not load product" message={error} />
  }
  if (!product) return null

  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : 0
  const inStock = product.stock > 0

  return (
    <div className="space-y-10">
      <nav className="text-xs text-gray-600">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <Link to="/products" className="hover:underline">Products</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <ProductGallery image={product.image_url} title={product.title} />
        </div>

        <div className="md:col-span-4 space-y-3">
          <h1 className="text-2xl font-medium text-gray-900">{product.title}</h1>
          {product.brand && (
            <p className="text-sm">
              Brand:{' '}
              <span className="text-blue-600 hover:underline cursor-pointer">{product.brand}</span>
            </p>
          )}
          <div className="flex items-center gap-3">
            <Rating value={product.rating} />
            <span className="text-sm text-blue-600">
              {product.review_count ? product.review_count.toLocaleString() + ' ratings' : ''}
            </span>
          </div>

          <hr />

          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              {hasDiscount && (
                <span className="bg-[#cc0c39] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  -{discountPct}%
                </span>
              )}
              <span className="text-3xl font-light text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
            {hasDiscount && (
              <div className="text-sm text-gray-600 mt-1">
                List Price:{' '}
                <span className="line-through">${Number(product.old_price).toFixed(2)}</span>
              </div>
            )}
          </div>

          <hr />

          <div>
            <h2 className="font-bold text-gray-900 mb-1">About this item</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="text-sm space-y-1 pt-2 border-t">
            <div className="flex items-center gap-2 text-gray-700">
              <Truck className="w-4 h-4" /> Free delivery on orders over $50
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <ShieldCheck className="w-4 h-4" /> Secure transaction
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="border border-gray-300 rounded-lg p-4 space-y-3 lg:sticky lg:top-40">
            <div className="text-2xl font-medium text-gray-900">
              ${Number(product.price).toFixed(2)}
            </div>
            <div className="text-sm text-gray-700">
              <span className="text-blue-600">FREE delivery</span> on orders over $50
            </div>
            <div className={'text-lg font-medium ' + (inStock ? 'text-green-700' : 'text-red-600')}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </div>
            {inStock && product.stock < 10 && (
              <div className="text-xs text-red-600">Only {product.stock} left in stock</div>
            )}

            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
              disabled={!inStock}
            />

            <Button
              variant="secondary"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </Button>

            <Button
              variant="primary"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="w-full flex items-center justify-center gap-2 bg-[#ffa41c] hover:bg-[#f39c12] text-gray-900"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </Button>

            <WishlistButton product={product} variant="text" className="w-full justify-center" />

            
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Customer reviews</h2>
        <ReviewsList
          productId={product.id}
          rating={product.rating}
          reviewCount={product.review_count}
        />
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related products</h2>
          <ProductGrid products={related} cols={4} />
        </section>
      )}

      {recommendations.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">You may also like</h2>
          <ProductGrid products={recommendations} cols={4} />
        </section>
      )}

      <RecentlyViewedStrip excludeId={product.id} />
    </div>
  )
}

