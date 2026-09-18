import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
  Calendar,
  DollarSign,
  Zap,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerCoupons,
  createSellerCoupon,
  deleteSellerCoupon,
  toggleCouponStatus,
} from '../../services/sellerService'
import { getSellerProducts } from '../../services/sellerService'

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'expired', label: 'Expired' },
]

export default function SellerCoupons() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [buckets, setBuckets] = useState({ active: [], scheduled: [], expired: [] })
  const [tab, setTab] = useState('active')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const [b, p] = await Promise.all([
        getSellerCoupons(user.id),
        getSellerProducts(user.id),
      ])
      setBuckets(b)
      setProducts(p)
    } catch (err) {
      pushToast('Could not load coupons', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  async function handleDelete(c) {
    if (!confirm('Delete "' + c.title + '"? This cannot be undone.')) return
    try {
      await deleteSellerCoupon(user.id, c.id)
      pushToast('Coupon deleted', { type: 'info' })
      load()
    } catch {
      pushToast('Could not delete', { type: 'error' })
    }
  }

  async function handleToggle(c) {
    const next = c.status === 'active' ? 'inactive' : 'active'
    try {
      await toggleCouponStatus(user.id, c.id, next)
      pushToast('Coupon ' + next, { type: 'info' })
      load()
    } catch {
      pushToast('Could not update', { type: 'error' })
    }
  }

  const list = buckets[tab] || []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-600">
            Create discounts that appear on the customer-facing Coupons page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition flex items-center gap-2 ' +
              (tab === t.id
                ? 'border-[#c7511f] text-[#c7511f]'
                : 'border-transparent text-gray-600 hover:text-gray-900')
            }
          >
            {t.label}
            {(buckets[t.id] || []).length > 0 && (
              <span
                className={
                  'text-xs px-1.5 py-0.5 rounded-full ' +
                  (tab === t.id ? 'bg-orange-100 text-[#c7511f]' : 'bg-gray-100 text-gray-600')
                }
              >
                {buckets[t.id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading coupons…
        </div>
      ) : list.length === 0 ? (
        <EmptyState tab={tab} onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((c) => (
            <CouponCard
              key={c.id}
              coupon={c}
              onDelete={() => handleDelete(c)}
              onToggle={() => handleToggle(c)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateCouponModal
          products={products}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function CouponCard({ coupon, onDelete, onToggle }) {
  const label =
    coupon.discount_type === 'percentage'
      ? `${Number(coupon.discount_value)}% off`
      : `$${Number(coupon.discount_value)} off`
  const product = coupon.products?.[0]
  const now = new Date()
  const end = coupon.end_date ? new Date(coupon.end_date) : null
  const start = coupon.start_date ? new Date(coupon.start_date) : null
  const expired = end && end < now
  const scheduled = start && start > now
  const status =
    coupon.status !== 'active'
      ? { label: 'Inactive', cls: 'bg-gray-100 text-gray-700' }
      : expired
      ? { label: 'Expired', cls: 'bg-red-100 text-red-800' }
      : scheduled
      ? { label: 'Scheduled', cls: 'bg-amber-100 text-amber-800' }
      : { label: 'Active', cls: 'bg-green-100 text-green-800' }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      {product?.image_url && (
        <div className="aspect-[16/9] overflow-hidden bg-gray-50">
          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xl font-bold text-[#b12704]">{label}</span>
          <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + status.cls}>
            {status.label}
          </span>
        </div>
        <div className="text-sm text-gray-600 line-clamp-2 mb-3">
          {coupon.description || coupon.title}
        </div>
        {product && (
          <div className="text-xs text-gray-500 mb-3">
            Applies to: <span className="text-gray-900">{product.title}</span>
          </div>
        )}

        <dl className="text-xs space-y-1 pt-3 border-t mb-3">
          {coupon.budget && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Budget</dt>
              <dd className="text-gray-900">${Number(coupon.budget).toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Start</dt>
            <dd className="text-gray-900">
              {start ? start.toLocaleDateString() : '—'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">End</dt>
            <dd className="text-gray-900">{end ? end.toLocaleDateString() : '—'}</dd>
          </div>
        </dl>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={onToggle}
            className="flex-1 text-xs border border-gray-300 hover:bg-gray-50 py-1.5 rounded"
          >
            {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ tab, onCreate }) {
  const messages = {
    active: 'No active coupons. Create one to boost your sales.',
    scheduled: 'No scheduled coupons.',
    expired: 'No expired coupons.',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
      <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">{messages[tab]}</h3>
      {tab === 'active' && (
        <button
          onClick={onCreate}
          className="mt-4 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create your first coupon
        </button>
      )}
    </div>
  )
}

function CreateCouponModal({ products, onClose, onCreated }) {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [productId, setProductId] = useState(products[0]?.id || '')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('20')
  const [budget, setBudget] = useState('500')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const inThirty = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(inThirty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const product = products.find((p) => p.id === productId)

  // Auto-title from product + discount
  const autoTitle = useMemo(() => {
    if (!product) return ''
    const d =
      discountType === 'percentage'
        ? `${discountValue}% off`
        : `$${discountValue} off`
    return `${d} ${product.title}`
  }, [product, discountType, discountValue])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productId) return setError('Select a product')
    if (!discountValue || Number(discountValue) <= 0)
      return setError('Enter a discount value greater than 0')
    if (discountType === 'percentage' && Number(discountValue) > 90)
      return setError('Percentage cannot exceed 90')
    if (endDate && new Date(endDate) <= new Date(startDate))
      return setError('End date must be after start date')

    setSaving(true)
    setError(null)
    try {
      await createSellerCoupon(user.id, {
        product_id: productId,
        title: title.trim() || autoTitle,
        description: description.trim() || 'Limited-time savings.',
        discount_type: discountType,
        discount_value: discountValue,
        budget,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      })
      pushToast('Coupon created', { type: 'success' })
      onCreated()
    } catch (err) {
      setError(err.message || 'Could not create coupon')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Create Coupon</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Discount type */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Discount type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={
                  'flex-1 px-3 py-2 rounded border text-sm ' +
                  (discountType === 'percentage'
                    ? 'border-[#c7511f] bg-orange-50 text-[#c7511f] font-medium'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                Percentage
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={
                  'flex-1 px-3 py-2 rounded border text-sm ' +
                  (discountType === 'fixed'
                    ? 'border-[#c7511f] bg-orange-50 text-[#c7511f] font-medium'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                Fixed amount
              </button>
            </div>
          </div>

          {/* Discount value */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              {discountType === 'percentage' ? 'Discount percent' : 'Discount amount'}
            </label>
            <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
              {discountType === 'fixed' && <DollarSign className="w-4 h-4 text-gray-500" />}
              <input
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="flex-1 text-sm focus:outline-none"
              />
              {discountType === 'percentage' && (
                <span className="text-sm text-gray-500">%</span>
              )}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Budget (USD) — maximum total discount
            </label>
            <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Title + description */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={autoTitle || 'e.g. 20% off Wireless Headphones'}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to auto-generate from the product and discount.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Limited-time savings on our best-selling headphones."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded disabled:opacity-60 transition"
            >
              {saving ? 'Creating…' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}