import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Ticket, ArrowRight, Scissors, CircleCheck, ImageOff } from 'lucide-react'
import { useCoupons } from '../context/CouponsContext'
import { useToast } from '../context/ToastContext'
import { getActiveCoupons } from '../services/couponService'
import { getAllCategories } from '../services/categoryService'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { formatPrice } from '../lib/utils'

function formatExpiry(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Coupon-shaped card: image + info stub, torn apart by a perforated seam. */
function CouponCard({ coupon, product }) {
  const { isClipped, clipCoupon, unclipCoupon } = useCoupons()
  const { pushToast } = useToast()
  const [pending, setPending] = useState(false)
  if (!product) return null

  const clipped = isClipped(coupon.id)
  const discountLabel =
    coupon.discount_type === 'percentage'
      ? `${Number(coupon.discount_value)}% off`
      : `${formatPrice(coupon.discount_value)} off`
  const expiry = formatExpiry(coupon.end_date)

  async function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    setPending(true)
    try {
      if (clipped) {
        await unclipCoupon(coupon.id)
        pushToast('Coupon removed', { type: 'info' })
      } else {
        await clipCoupon(coupon.id)
        pushToast('Coupon clipped! It will apply at checkout.', { type: 'success' })
      }
    } catch (err) {
      console.warn(err)
      pushToast('Could not update coupon', { type: 'error' })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="group relative flex flex-col bg-bone-50 border border-stone-200 rounded-2xl overflow-hidden shadow-subtle hover:shadow-card hover:border-stone-300 transition-avenzo">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] bg-stone-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-avenzo duration-slow"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-charcoal-300" strokeWidth={1.5} />
          </div>
        )}
      </Link>

      {/* Perforated seam with punch-hole notches, coupon-stub style */}
      <div className="relative shrink-0">
        <span className="absolute -left-2.5 top-0 -translate-y-1/2 w-5 h-5 rounded-full bg-bone-100" />
        <span className="absolute -right-2.5 top-0 -translate-y-1/2 w-5 h-5 rounded-full bg-bone-100" />
        <div className="border-t border-dashed border-stone-300 mx-4" />
      </div>

      <div className="p-4 pt-3.5 flex flex-col flex-1">
        <div className="text-price-lg text-brass-600">{discountLabel}</div>
        <p className="text-body-sm line-clamp-2 mt-1 mb-2">{coupon.description}</p>
        <Link
          to={`/products/${product.id}`}
          className="text-sm font-medium text-charcoal-800 hover:text-charcoal-900 line-clamp-2 transition-avenzo"
        >
          {product.title}
        </Link>
        <div className="text-sm font-semibold text-charcoal-900 mt-1 mb-2">
          {formatPrice(product.price)}
        </div>
        {expiry && <p className="text-caption mb-3">Expires {expiry}</p>}

        <button
          onClick={toggle}
          disabled={pending}
          className={
            'mt-auto w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 rounded-lg border transition-avenzo disabled:opacity-60 active:scale-[0.98] ' +
            (clipped
              ? 'bg-success-50 border-success-500/40 text-success-700'
              : 'bg-brass-400 border-brass-400 text-charcoal-900 hover:bg-brass-300')
          }
        >
          {clipped ? (
            <>
              <CircleCheck key="clipped" className="w-4 h-4 animate-bump" />
              Coupon Clipped
            </>
          ) : (
            <>
              <Scissors key="unclipped" className="w-4 h-4" />
              Clip Coupon
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [cpns, cats] = await Promise.all([getActiveCoupons(), getAllCategories()])
        if (cancelled) return
        setCoupons(cpns)
        setCategories(cats)
      } catch (err) {
        console.warn(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // flatten coupons to (coupon, product) pairs
  const pairs = useMemo(() => {
    const out = []
    for (const c of coupons) {
      for (const p of c.products || []) out.push({ coupon: c, product: p })
    }
    return out
  }, [coupons])

  const filtered = useMemo(() => {
    let list = pairs

    // Search filter
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((x) => {
        const title = (x.product.title || '').toLowerCase()
        const brand = (x.product.brand || '').toLowerCase()
        const couponTitle = (x.coupon.title || '').toLowerCase()
        return title.includes(q) || brand.includes(q) || couponTitle.includes(q)
      })
    }

    // Category filter
    if (activeCategory !== 'all') {
      const cat = categories.find((c) => c.slug === activeCategory)
      if (cat) {
        list = list.filter((x) => x.product.category_id === cat.id)
      }
    }

    return list
  }, [pairs, query, activeCategory, categories])

  const featured = filtered.slice(0, 4)
  const twentyPlus = filtered.filter(
    (x) => x.coupon.discount_type === 'percentage' && Number(x.coupon.discount_value) >= 20
  )

  const CATS = [{ slug: 'all', name: 'All' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <p className="text-av-label uppercase tracking-wide font-medium text-brass-600 mb-1.5 flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" /> Savings
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="heading-page">Coupons</h1>
            <p className="text-body-sm mt-1.5">Clip coupons and they'll apply automatically at checkout.</p>
          </div>
          <Link
            to="/coupons/my-coupons"
            className="text-sm font-medium text-charcoal-700 hover:text-brass-600 inline-flex items-center gap-1 transition-avenzo"
          >
            Your clipped coupons
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-stretch bg-bone-50 border border-stone-300 focus-within:border-brass-400 rounded-full h-12 mb-5 max-w-xl transition-avenzo shadow-subtle"
      >
        <div className="flex items-center pl-4 text-charcoal-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, or coupons"
          className="flex-1 min-w-0 bg-transparent px-3 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
        />
      </form>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-stone-200">
        {CATS.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActiveCategory(c.slug)}
            className={
              'text-sm px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-avenzo ' +
              (activeCategory === c.slug
                ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
                : 'bg-bone-50 border-stone-300 text-charcoal-700 hover:border-stone-400')
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No coupons found"
          message="Try adjusting your search or browse all coupons."
        />
      ) : (
        <>
          <section className="mb-10">
            <h2 className="heading-section mb-4">Featured Coupons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((x) => (
                <CouponCard key={x.coupon.id + x.product.id} coupon={x.coupon} product={x.product} />
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="heading-section mb-4">Today's Coupons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.slice(0, 8).map((x) => (
                <CouponCard key={'today' + x.coupon.id + x.product.id} coupon={x.coupon} product={x.product} />
              ))}
            </div>
          </section>

          {twentyPlus.length > 0 && (
            <section className="mb-10">
              <h2 className="heading-section mb-4">20% Off or More</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {twentyPlus.map((x) => (
                  <CouponCard key={'p20' + x.coupon.id + x.product.id} coupon={x.coupon} product={x.product} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
