import { useEffect, useState } from 'react'
import {
  Plus,
  RefreshCw,
  TrendingDown,
  Clock,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerDeals,
  createSellerDeal,
  cancelSellerDeal,
  getSellerProducts,
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const TABS = [
  { id: 'active', label: 'Active Deals', icon: TrendingDown },
  { id: 'upcoming', label: 'Upcoming', icon: Clock },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
]

export default function SellerDeals() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [buckets, setBuckets] = useState({ active: [], upcoming: [], completed: [] })
  const [tab, setTab] = useState('active')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const [b, p] = await Promise.all([
        getSellerDeals(user.id),
        getSellerProducts(user.id),
      ])
      setBuckets(b)
      setProducts(p)
    } catch {
      pushToast('Could not load deals', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  async function handleCancel(d) {
    if (!confirm('Cancel this deal?')) return
    try {
      await cancelSellerDeal(user.id, d.id)
      pushToast('Deal cancelled', { type: 'info' })
      load()
    } catch {
      pushToast('Could not cancel deal', { type: 'error' })
    }
  }

  const list = buckets[tab] || []

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Deals"
        description="Create time-limited deals that appear on the customer-facing Deals page."
        actions={
          <>
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create Deal
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
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
              <Icon className="w-4 h-4" />
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
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <SellerDealsEmpty tab={tab} onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((d) => (
            <DealCard key={d.id} deal={d} onCancel={() => handleCancel(d)} tab={tab} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateDealModal
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

function DealCard({ deal, onCancel, tab }) {
  const discountPct =
    deal.original_price > 0
      ? Math.round((1 - deal.deal_price / deal.original_price) * 100)
      : 0
  const now = new Date()
  const end = new Date(deal.end_date)
  const start = new Date(deal.start_date)
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000))
  const progress =
    deal.quantity_limit > 0
      ? Math.min(100, (deal.quantity_sold / deal.quantity_limit) * 100)
      : 0

  const statusBadge =
    tab === 'active'
      ? { label: `${daysLeft}d left`, color: 'green' }
      : tab === 'upcoming'
      ? { label: 'Scheduled', color: 'yellow' }
      : { label: 'Ended', color: 'gray' }

  return (
    <Card padding="none" hoverable className="overflow-hidden flex flex-col">
      {deal.product?.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-50">
          <img src={deal.product.image_url} alt="" className="w-full h-full object-cover" />
          <span className="absolute top-2 left-2 bg-error-500 text-bone-50 text-xs font-bold px-2 py-1 rounded-md">
            -{discountPct}%
          </span>
          <span className="absolute top-2 right-2">
            <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
          </span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-sm font-medium text-charcoal-900 line-clamp-2 mb-2">
          {deal.product?.title || 'Product'}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-price-lg">${Number(deal.deal_price).toFixed(2)}</span>
          <span className="text-xs text-charcoal-400 line-through">
            ${Number(deal.original_price).toFixed(2)}
          </span>
        </div>

        {tab === 'active' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-charcoal-500 mb-1">
              <span>
                {deal.quantity_sold} / {deal.quantity_limit} claimed
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brass-400 transition-avenzo"
                style={{ width: progress + '%' }}
              />
            </div>
          </div>
        )}

        <dl className="text-xs space-y-1.5 pt-3 border-t border-stone-200 mb-3">
          <div className="flex justify-between">
            <dt className="text-charcoal-500">Start</dt>
            <dd className="text-charcoal-900">{start.toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal-500">End</dt>
            <dd className="text-charcoal-900">{end.toLocaleDateString()}</dd>
          </div>
        </dl>

        {(tab === 'active' || tab === 'upcoming') && (
          <Button variant="danger" size="sm" onClick={onCancel} className="mt-auto w-full">
            <Trash2 className="w-3.5 h-3.5" /> Cancel deal
          </Button>
        )}
      </div>
    </Card>
  )
}

function SellerDealsEmpty({ tab, onCreate }) {
  const messages = {
    active: 'No active deals. Create one to boost visibility.',
    upcoming: 'No upcoming deals scheduled.',
    completed: 'No completed deals yet.',
  }
  return (
    <EmptyState
      icon={TrendingDown}
      title={messages[tab]}
      action={
        tab === 'active' ? (
          <Button variant="primary" onClick={onCreate}>
            <Plus className="w-4 h-4" /> Create your first deal
          </Button>
        ) : undefined
      }
    />
  )
}

function CreateDealModal({ products, onClose, onCreated }) {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [productId, setProductId] = useState(products[0]?.id || '')
  const [dealPrice, setDealPrice] = useState('')
  const [quantityLimit, setQuantityLimit] = useState('100')
  const today = new Date().toISOString().slice(0, 10)
  const inSeven = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(inSeven)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const product = products.find((p) => p.id === productId)
  const originalPrice = product ? Number(product.price) : 0
  const discountPct =
    originalPrice > 0 && dealPrice
      ? Math.round((1 - Number(dealPrice) / originalPrice) * 100)
      : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productId) return setError('Select a product')
    if (!dealPrice || Number(dealPrice) <= 0)
      return setError('Enter a deal price greater than 0')
    if (Number(dealPrice) >= originalPrice)
      return setError('Deal price must be lower than the current price')
    if (new Date(endDate) <= new Date(startDate))
      return setError('End date must be after start date')

    setSaving(true)
    setError(null)
    try {
      await createSellerDeal(user.id, {
        product_id: productId,
        deal_price: dealPrice,
        quantity_limit: quantityLimit,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      })
      pushToast('Deal created', { type: 'success' })
      onCreated()
    } catch (err) {
      setError(err.message || 'Could not create deal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted border border-stone-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-bone-50/95 backdrop-blur border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub">Create Deal</h2>
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
                  {p.title} — ${Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {product && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm flex justify-between">
              <span className="text-charcoal-500">Current price</span>
              <span className="font-medium text-charcoal-900">${originalPrice.toFixed(2)}</span>
            </div>
          )}

          <div>
            <Input
              label="Deal price"
              type="number"
              step="0.01"
              value={dealPrice}
              onChange={(e) => setDealPrice(e.target.value)}
              placeholder="39.99"
            />
            {discountPct > 0 && (
              <p className="text-caption text-success-700 mt-1.5">
                That's <strong>{discountPct}% off</strong> the original price.
              </p>
            )}
          </div>

          <Input
            label="Quantity limit"
            type="number"
            value={quantityLimit}
            onChange={(e) => setQuantityLimit(e.target.value)}
            placeholder="100"
            hint="Maximum units sold at the deal price."
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
              {saving ? 'Creating…' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
