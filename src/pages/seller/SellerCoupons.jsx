import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

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
    } catch {
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
      <SellerPageHeader
        title="Coupons"
        description="Create discounts that appear on the customer-facing Coupons page."
        actions={
          <>
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create Coupon
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo flex items-center gap-2 ' +
              (tab === t.id
                ? 'border-brass-500 text-charcoal-900'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
            }
          >
            {t.label}
            {(buckets[t.id] || []).length > 0 && (
              <span
                className={
                  'text-xs px-1.5 py-0.5 rounded-full ' +
                  (tab === t.id ? 'bg-brass-50 text-brass-700' : 'bg-stone-100 text-charcoal-500')
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <SellerCouponsEmpty tab={tab} onCreate={() => setShowCreate(true)} />
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
      ? { label: 'Inactive', color: 'gray' }
      : expired
      ? { label: 'Expired', color: 'red' }
      : scheduled
      ? { label: 'Scheduled', color: 'yellow' }
      : { label: 'Active', color: 'green' }

  return (
    <Card padding="none" hoverable className="overflow-hidden flex flex-col">
      {product?.image_url && (
        <div className="aspect-[16/9] overflow-hidden bg-stone-50">
          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xl font-display text-charcoal-900">{label}</span>
          <Badge color={status.color}>{status.label}</Badge>
        </div>
        <div className="text-body-sm line-clamp-2 mb-3">{coupon.description || coupon.title}</div>
        {product && (
          <div className="text-caption mb-3">
            Applies to: <span className="text-charcoal-800">{product.title}</span>
          </div>
        )}

        <dl className="text-xs space-y-1.5 pt-3 border-t border-stone-200 mb-3">
          {coupon.budget && (
            <div className="flex justify-between">
              <dt className="text-charcoal-500">Budget</dt>
              <dd className="text-charcoal-900">${Number(coupon.budget).toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-charcoal-500">Start</dt>
            <dd className="text-charcoal-900">{start ? start.toLocaleDateString() : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal-500">End</dt>
            <dd className="text-charcoal-900">{end ? end.toLocaleDateString() : '—'}</dd>
          </div>
        </dl>

        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={onToggle} className="flex-1">
            {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

function SellerCouponsEmpty({ tab, onCreate }) {
  const messages = {
    active: 'No active coupons. Create one to boost your sales.',
    scheduled: 'No scheduled coupons.',
    expired: 'No expired coupons.',
  }
  return (
    <EmptyState
      icon={Tag}
      title={messages[tab]}
      action={
        tab === 'active' ? (
          <Button variant="primary" onClick={onCreate}>
            <Plus className="w-4 h-4" /> Create your first coupon
          </Button>
        ) : undefined
      }
    />
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

  const autoTitle = useMemo(() => {
    if (!product) return ''
    const d = discountType === 'percentage' ? `${discountValue}% off` : `$${discountValue} off`
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
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted border border-stone-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-bone-50/95 backdrop-blur border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub">Create Coupon</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-label mb-1.5">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-label mb-1.5">Discount type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={
                  'flex-1 px-3 py-2.5 rounded-lg border text-sm transition-avenzo ' +
                  (discountType === 'percentage'
                    ? 'border-brass-400 bg-brass-50 text-brass-700 font-medium'
                    : 'border-stone-300 hover:border-stone-400')
                }
              >
                Percentage
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={
                  'flex-1 px-3 py-2.5 rounded-lg border text-sm transition-avenzo ' +
                  (discountType === 'fixed'
                    ? 'border-brass-400 bg-brass-50 text-brass-700 font-medium'
                    : 'border-stone-300 hover:border-stone-400')
                }
              >
                Fixed amount
              </button>
            </div>
          </div>

          <Input
            label={discountType === 'percentage' ? 'Discount percent' : 'Discount amount'}
            type="number"
            step="0.01"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />

          <Input
            label="Budget (USD) — maximum total discount"
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={autoTitle || 'e.g. 20% off Wireless Headphones'}
            hint="Leave blank to auto-generate from the product and discount."
          />

          <div>
            <label className="block text-label mb-1.5">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Limited-time savings on our best-selling headphones."
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/25 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {saving ? 'Creating…' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
