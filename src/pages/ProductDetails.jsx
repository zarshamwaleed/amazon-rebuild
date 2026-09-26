import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Zap, Truck, ShieldCheck, Gift, Check, RotateCcw } from 'lucide-react'
import Rating from '../components/Rating'
import ProductGallery from '../components/ProductGallery'
import QuantitySelector from '../components/QuantitySelector'
import ReviewsList from '../components/ReviewsList'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import WishlistButton from '../components/WishlistButton'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import AddToRegistryModal from '../components/AddToRegistryModal'
import WriteReviewModal from '../components/WriteReviewModal'
import SectionHeader from '../components/SectionHeader'
import Reveal from '../components/home/Reveal'
import { supabase } from '../services/supabase'
import { getRecommendations } from '../services/recommendationService'
import { getCouponsForProduct } from '../services/couponService'
import { useCoupons } from '../context/CouponsContext'
import { useCart } from '../context/CartContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'

const INFO_TABS = [
  { key: 'description', label: 'Description' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'delivery', label: 'Delivery & Returns' },
]

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
  const [showAddToRegistry, setShowAddToRegistry] = useState(false)
  const [addedToRegistry, setAddedToRegistry] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [infoTab, setInfoTab] = useState('description')
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0)
  const tabsRef = useRef(null)

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
        setInfoTab('description')

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

  async function handleAddToCart() {
    if (!product) return
    await addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1600)
  }

  function handleBuyNow() {
    if (!product) return
    addItem(product, quantity)
    navigate('/cart')
  }

  function goToReviews() {
    setInfoTab('reviews')
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 aspect-square skeleton-shimmer rounded-xl" />
        <div className="lg:col-span-6 space-y-4">
          <div className="skeleton-shimmer h-3.5 w-24 rounded" />
          <div className="skeleton-shimmer h-9 w-3/4 rounded" />
          <div className="skeleton-shimmer h-4 w-1/3 rounded" />
          <div className="skeleton-shimmer h-10 w-1/4 rounded" />
          <div className="skeleton-shimmer h-32 rounded-xl" />
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
  const galleryImages = Array.from(
    new Set([product.image_url, ...(product.additional_images || [])].filter(Boolean))
  )
  const variations = (product.variations || []).filter((v) => v.name && v.options)
  const highlights = (product.bullet_points || []).filter(Boolean)

  const specs = [
    product.brand && { label: 'Brand', value: product.brand },
    product.manufacturer && { label: 'Manufacturer', value: product.manufacturer },
    product.product_type && { label: 'Product type', value: product.product_type },
    product.sku && { label: 'SKU', value: product.sku },
    hasDiscount &&
      product.msrp &&
      Number(product.msrp) !== Number(product.price) && {
        label: 'MSRP',
        value: '$' + Number(product.msrp).toFixed(2),
      },
    {
      label: 'Fulfillment',
      value:
        product.fulfillment_method === 'FBA'
          ? 'Fulfilled by Amazon Rebuild'
          : 'Fulfilled by seller',
    },
  ].filter(Boolean)

  return (
    <div className="space-y-14">
      <nav className="text-av-caption text-charcoal-500 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-charcoal-800 transition-avenzo">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-charcoal-800 transition-avenzo">
          Products
        </Link>
        <span>/</span>
        <span className="text-charcoal-800 line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-6">
          <Reveal variant="fade">
            <ProductGallery images={galleryImages} title={product.title} />
          </Reveal>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {product.brand && (
            <p className="text-av-label uppercase tracking-wide text-brass-700">{product.brand}</p>
          )}
          <h1 className="font-display text-heading-page lg:text-display-sm text-charcoal-900 leading-tight">
            {product.title}
          </h1>

          {sellerInfo && (
            <p className="text-body-sm">
              Sold by{' '}
              <Link
                to={`/seller/${sellerInfo.user_id}`}
                className="text-brass-700 font-medium hover:underline"
              >
                {sellerInfo.store_name || 'this seller'}
              </Link>
            </p>
          )}

          <button type="button" onClick={goToReviews} className="flex items-center gap-2 w-fit">
            <Rating value={product.rating} showCount={false} />
            <span className="text-av-body-sm text-brass-700 hover:underline">
              {product.review_count
                ? product.review_count.toLocaleString() + ' ratings'
                : 'No ratings yet'}
            </span>
          </button>

          <div className="h-px bg-stone-200" />

          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="font-display text-display-sm text-charcoal-900">
                ${Number(product.price).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="bg-error-50 text-error-700 text-av-caption font-semibold px-2 py-0.5 rounded-full">
                  -{discountPct}%
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-caption mt-1">
                List price: <span className="line-through">${Number(product.old_price).toFixed(2)}</span>
              </p>
            )}
          </div>

          {productCoupons.length > 0 && (
            <div className="bg-brass-50 border border-brass-200 rounded-xl p-4 space-y-2.5">
              <p className="text-av-label uppercase tracking-wide text-brass-700">Special offer</p>
              {productCoupons.map((c) => {
                const clipped = isClipped(c.id)
                const label =
                  c.discount_type === 'percentage'
                    ? `${Number(c.discount_value)}% off`
                    : `$${Number(c.discount_value)} off`
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3">
                    <div className="text-av-body-sm text-charcoal-800">
                      <span className="font-semibold">{label}</span>
                      {c.minimum_purchase > 0 && (
                        <span className="text-av-caption text-charcoal-500">
                          {' '}
                          (min ${Number(c.minimum_purchase).toFixed(2)})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => (clipped ? unclipCoupon(c.id) : clipCoupon(c.id))}
                      className={
                        'text-av-caption font-medium px-3 py-1 rounded-full border transition-avenzo ' +
                        (clipped
                          ? 'bg-stone-100 border-stone-300 text-charcoal-600'
                          : 'bg-bone-50 border-brass-400 text-brass-700 hover:bg-brass-100')
                      }
                    >
                      {clipped ? '✓ Clipped' : 'Clip Coupon'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {variations.length > 0 && (
            <div className="space-y-4">
              {variations.map((v, i) => (
                <VariantGroup key={i} name={v.name} options={v.options} />
              ))}
            </div>
          )}

          {highlights.length > 0 && (
            <div>
              <p className="text-av-label uppercase tracking-wide text-charcoal-600 mb-2">
                Highlights
              </p>
              <ul className="space-y-2">
                {highlights.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-av-body-sm text-charcoal-700">
                    <Check className="w-4 h-4 text-brass-600 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-av-body-sm space-y-1.5 pt-2 border-t border-stone-200">
            <div className="flex items-center gap-2 text-charcoal-600">
              <Truck className="w-4 h-4" /> Free delivery on orders over $50
            </div>
            <div className="flex items-center gap-2 text-charcoal-600">
              <ShieldCheck className="w-4 h-4" /> Secure transaction
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-40">
            <div className="bg-bone-50 border border-stone-200 rounded-2xl shadow-card p-6 space-y-4">
              <div className="font-display text-heading-page text-charcoal-900">
                ${Number(product.price).toFixed(2)}
              </div>
              <div className="text-av-body-sm text-charcoal-600">
                <span className="text-brass-700 font-medium">FREE delivery</span> on orders over $50
              </div>
              <div
                className={
                  'text-av-body-sm font-semibold ' +
                  (inStock ? 'text-success-700' : 'text-error-700')
                }
              >
                {inStock ? 'In Stock' : 'Out of Stock'}
              </div>
              {inStock && product.stock < 10 && (
                <div className="text-av-caption text-error-500">Only {product.stock} left in stock</div>
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
                className="w-full"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </Button>

              {addedToRegistry ? (
                <div className="text-av-body-sm text-success-700 bg-success-50 border border-success-500/20 rounded-lg p-2.5 text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Added to your registry
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAddToRegistry(true)}
                  className="w-full"
                >
                  <Gift className="w-4 h-4" /> Add to Registry
                </Button>
              )}

              <Button variant="primary" onClick={handleBuyNow} disabled={!inStock} className="w-full">
                <Zap className="w-4 h-4" /> Buy Now
              </Button>

              <WishlistButton product={product} variant="text" className="w-full justify-center" />

              {sellerInfo && (
                <div className="text-av-caption text-charcoal-500 border-t border-stone-200 pt-3 mt-1">
                  Ships from Amazon Rebuild · Sold by{' '}
                  <Link
                    to={`/seller/${sellerInfo.user_id}`}
                    className="text-brass-700 hover:underline"
                  >
                    {sellerInfo.store_name || 'Seller'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Reveal variant="up">
        <section ref={tabsRef}>
          <div className="flex items-center gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
            {INFO_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setInfoTab(t.key)}
                className={
                  'relative px-4 sm:px-5 py-3 text-av-label uppercase tracking-wide whitespace-nowrap transition-avenzo ' +
                  (infoTab === t.key ? 'text-charcoal-900' : 'text-charcoal-400 hover:text-charcoal-700')
                }
              >
                {t.label}
                {infoTab === t.key && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brass-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div key={infoTab} className="pt-6 animate-fade-in-up">
            {infoTab === 'description' && (
              <p className="text-body leading-relaxed max-w-2xl whitespace-pre-line">
                {product.description || 'No description available for this product.'}
              </p>
            )}

            {infoTab === 'specifications' && (
              <dl className="divide-y divide-stone-200 border-t border-stone-200 max-w-xl">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 py-3 text-av-body-sm">
                    <dt className="text-charcoal-500">{s.label}</dt>
                    <dd className="text-charcoal-800 font-medium text-right">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {infoTab === 'reviews' && (
              <>
                <div className="flex justify-end mb-5">
                  <Button variant="outline" onClick={() => setShowWriteReview(true)}>
                    Write a review
                  </Button>
                </div>
                <ReviewsList
                  productId={product.id}
                  rating={product.rating}
                  reviewCount={product.review_count}
                  refreshKey={reviewsRefreshKey}
                />
              </>
            )}

            {infoTab === 'delivery' && (
              <div className="space-y-4 max-w-xl">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-charcoal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-av-body-sm font-medium text-charcoal-800">
                      Free delivery on orders over $50
                    </p>
                    <p className="text-caption mt-0.5">
                      {product.fulfillment_method === 'FBA'
                        ? 'Fulfilled by Amazon Rebuild for fast, reliable shipping.'
                        : 'Shipped directly by the seller.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-charcoal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-av-body-sm font-medium text-charcoal-800">Secure transaction</p>
                    <p className="text-caption mt-0.5">
                      Your payment information is protected at every step.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-charcoal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-av-body-sm font-medium text-charcoal-800">Easy returns</p>
                    <p className="text-caption mt-0.5">
                      Track eligible returns from{' '}
                      <Link to="/returns" className="text-brass-700 hover:underline">
                        Your Returns
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {sellerInfo?.user_id && (
        <SellerOtherProducts sellerId={sellerInfo.user_id} excludeId={product?.id} />
      )}

      {related.length > 0 && (
        <section>
          <SectionHeader title="Related products" />
          <ProductGrid products={related} cols={4} />
        </section>
      )}

      {recommendations.length > 0 && (
        <section>
          <SectionHeader title="You may also like" />
          <ProductGrid products={recommendations} cols={4} />
        </section>
      )}

      <RecentlyViewedStrip excludeId={product.id} />

      {showAddToRegistry && (
        <AddToRegistryModal
          product={product}
          onClose={() => setShowAddToRegistry(false)}
          onAdded={() => {
            setShowAddToRegistry(false)
            setAddedToRegistry(true)
          }}
        />
      )}

      {showWriteReview && (
        <WriteReviewModal
          product={product}
          onClose={() => setShowWriteReview(false)}
          onSubmitted={async () => {
            setShowWriteReview(false)
            setReviewsRefreshKey((k) => k + 1)
            const { data } = await supabase
              .from('products')
              .select('rating, review_count')
              .eq('id', product.id)
              .maybeSingle()
            if (data) setProduct((p) => (p ? { ...p, ...data } : p))
          }}
        />
      )}
    </div>
  )
}

function VariantGroup({ name, options }) {
  const list = (options || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const [selected, setSelected] = useState(list[0] || '')

  if (!list.length) return null

  return (
    <div>
      <p className="text-av-label uppercase tracking-wide text-charcoal-600 mb-2">
        {name}
        {selected && (
          <span className="text-charcoal-900 font-semibold normal-case tracking-normal">
            : {selected}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {list.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSelected(opt)}
            aria-pressed={selected === opt}
            className={
              'px-3.5 py-1.5 rounded-full border text-av-body-sm transition-avenzo ' +
              (selected === opt
                ? 'border-charcoal-900 bg-charcoal-900 text-bone-50'
                : 'border-stone-300 bg-bone-50 text-charcoal-700 hover:border-stone-400')
            }
          >
            {opt}
          </button>
        ))}
      </div>
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
      <SectionHeader title="Other products from this seller" />
      <ProductGrid products={items} cols={4} />
    </section>
  )
}
