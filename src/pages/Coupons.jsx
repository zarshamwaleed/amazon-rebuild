import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useCoupons } from '../context/CouponsContext'
import { useToast } from '../context/ToastContext'
import { getActiveCoupons } from '../services/couponService'
import { getAllCategories } from '../services/categoryService'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

function CouponCard({ coupon, product }) {
  const { isClipped, clipCoupon, unclipCoupon } = useCoupons()
  const { pushToast } = useToast()
  if (!product) return null

  const clipped = isClipped(coupon.id)
  const label =
    coupon.discount_type === 'percentage'
      ? `${Number(coupon.discount_value)}% off`
      : `$${Number(coupon.discount_value)} off`

  async function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (clipped) {
        await unclipCoupon(coupon.id)
        pushToast('Coupon removed', { type: 'info' })
      } else {
        await clipCoupon(coupon.id)
        pushToast('Coupon clipped! It will apply at checkout.', { type: 'success' })
      }
    } catch (err) {
      pushToast('Could not update coupon', { type: 'error' })
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`} className="block aspect-square bg-gray-50 overflow-hidden">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition"
            loading="lazy"
          />
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs font-bold text-[#b12704] uppercase mb-1">{label}</div>
        <div className="text-sm text-gray-600 mb-3 line-clamp-2">{coupon.description}</div>
        <Link
          to={`/products/${product.id}`}
          className="text-sm font-medium text-gray-900 hover:text-[#c7511f] line-clamp-2 mb-2"
        >
          {product.title}
        </Link>
        <div className="text-lg font-bold text-gray-900 mb-3">
          ${Number(product.price).toFixed(2)}
        </div>
        <button
          onClick={toggle}
          className={
            'mt-auto w-full text-sm font-medium py-2 rounded border transition ' +
            (clipped
              ? 'bg-gray-100 border-gray-300 text-gray-700'
              : 'bg-[#febd69] border-[#febd69] hover:bg-[#f3a847] text-gray-900')
          }
        >
          {clipped ? '✓ Coupon Clipped' : 'Clip Coupon'}
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
  const twentyPlus = filtered.filter((x) =>
    x.coupon.discount_type === 'percentage' && Number(x.coupon.discount_value) >= 20
  )

  const CATS = [
    { slug: 'all', name: 'All' },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ]

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white rounded-lg p-6 md:p-10 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Coupons</h1>
        <p className="text-gray-200 mb-5">Save more on products you love.</p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-stretch rounded overflow-hidden max-w-xl"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, or coupons"
            className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </form>
      </div>

      {/* My coupons link */}
      <div className="flex justify-end mb-4">
        <Link
          to="/coupons/my-coupons"
          className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
        >
          View Your Coupons →
        </Link>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b">
        {CATS.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActiveCategory(c.slug)}
            className={
              'text-sm px-3 py-1.5 rounded-full border whitespace-nowrap transition ' +
              (activeCategory === c.slug
                ? 'bg-[#232f3e] text-white border-[#232f3e]'
                : 'bg-white border-gray-300 hover:border-gray-500')
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
          title="No coupons found"
          message="Try adjusting your search or browse all coupons."
        />
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Coupons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((x) => (
                <CouponCard key={x.coupon.id + x.product.id} coupon={x.coupon} product={x.product} />
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Coupons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.slice(0, 8).map((x) => (
                <CouponCard key={'today' + x.coupon.id + x.product.id} coupon={x.coupon} product={x.product} />
              ))}
            </div>
          </section>

          {twentyPlus.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">20% Off or More</h2>
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