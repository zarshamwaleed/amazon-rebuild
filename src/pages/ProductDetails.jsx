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
import { getCouponsForProduct } from '../services/couponService'
import { useCoupons } from '../context/CouponsContext'
import { useCart } from '../context/CartContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isClipped, clipCoupon, unclipCoupon } = useCoupons()
  useRecentlyViewed(id)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [productCoupons, setProductCoupons] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sellerInfo, setSellerInfo] = useState(null)

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

        if (data.seller_id) {
          const { data: sp } = await supabase
            .from('seller_profiles')
            .select('user_id, store_name, business_name')
            .eq('user_id', data.seller_id)
            .maybeSingle()
          if (!cancelled) setSellerInfo(sp || { user_id: data.seller_id, store_name: null })
        }

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

  useEffect(() => {
    if (!product) return
    let cancelled = false
    getCouponsForProduct(product.id)
      .then((list) => {
        if (!cancelled) setProductCoupons(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [product?.id])

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
          {sellerInfo && (
            <p className="text-sm text-gray-700">
              Sold by{' '}
              <Link
                to={`/seller/${sellerInfo.user_id}`}
                className="text-[#007185] hover:text-[#c7511f] hover:underline font-medium"
              >
                {sellerInfo.store_name || 'this seller'}
              </Link>
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

          {productCoupons.length > 0 && (
            <div className="bg-[#f0f2f2] border border-[#d5d9d9] rounded p-3 space-y-2">
              <p className="text-xs font-bold text-[#b12704] uppercase">Special offer</p>
              {productCoupons.map((c) => {
                const clipped = isClipped(c.id)
                const label =
                  c.discount_type === 'percentage'
                    ? `${Number(c.discount_value)}% off`
                    : `$${Number(c.discount_value)} off`
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-900">
                      <span className="font-semibold">{label}</span>
                      {c.minimum_purchase > 0 && (
                        <span className="text-xs text-gray-600">
                          {' '}
                          (min ${Number(c.minimum_purchase).toFixed(2)})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => (clipped ? unclipCoupon(c.id) : clipCoupon(c.id))}
                      className={
                        'text-xs font-medium px-3 py-1 rounded border transition ' +
                        (clipped
                          ? 'bg-gray-100 border-gray-300 text-gray-700'
                          : 'bg-white border-[#007185] text-[#007185] hover:bg-[#e7f4f5]')
                      }
                    >
                      {clipped ? '✓ Clipped' : 'Clip Coupon'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

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

            {sellerInfo && (
              <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                Ships from Amazon Rebuild · Sold by{' '}
                <Link
                  to={`/seller/${sellerInfo.user_id}`}
                  className="text-[#007185] hover:text-[#c7511f] hover:underline"
                >
                  {sellerInfo.store_name || 'Seller'}
                </Link>
              </div>
            )}
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

      {sellerInfo?.user_id && (
        <SellerOtherProducts sellerId={sellerInfo.user_id} excludeId={product?.id} />
      )}

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

function SellerOtherProducts({ sellerId, excludeId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) return
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .neq('id', excludeId || '00000000-0000-0000-0000-000000000000')
        .limit(4)
      if (!cancelled) {
        setItems(data || [])
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [sellerId, excludeId])

  if (loading || items.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Other products from this seller
      </h2>
      <ProductGrid products={items} cols={4} />
    </section>
  )
}