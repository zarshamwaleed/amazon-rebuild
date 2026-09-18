import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
  Calendar,
  DollarSign,
  TrendingDown,
  Package,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerDeals,
  createSellerDeal,
  cancelSellerDeal,
  getSellerProducts,
} from '../../services/sellerService'

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
    } catch (err) {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-sm text-gray-600">
            Create time-limited deals that appear on the customer-facing Deals page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" /> Create Deal
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
        {TABS.map((t) => {
          const Icon = t.icon
          return (
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
              <Icon className="w-4 h-4" />
              {t.label}
              {(buckets[t.id] || []).length > 0 && (
                <span
                  className={
                    'text-xs px-1.5 py-0.5 rounded-full ' +
                    (tab === t.id
                      ? 'bg-orange-100 text-[#c7511f]'
                      : 'bg-gray-100 text-gray-600')
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
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading deals…
        </div>
      ) : list.length === 0 ? (
        <EmptyState tab={tab} onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((d) => (
            <DealCard
              key={d.id}
              deal={d}
              onCancel={() => handleCancel(d)}
              tab={tab}
            />
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
      ? { label: `${daysLeft}d left`, cls: 'bg-green-100 text-green-800' }
      : tab === 'upcoming'
      ? { label: 'Scheduled', cls: 'bg-amber-100 text-amber-800' }
      : { label: 'Ended', cls: 'bg-gray-100 text-gray-600' }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      {deal.product?.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
          <img
            src={deal.product.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 left-2 bg-[#cc0c39] text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPct}%
          </span>
          <span
            className={'absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ' + statusBadge.cls}
          >
            {statusBadge.label}
          </span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {deal.product?.title || 'Product'}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-[#b12704]">
            ${Number(deal.deal_price).toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            ${Number(deal.original_price).toFixed(2)}
          </span>
        </div>

        {tab === 'active' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {deal.quantity_sold} / {deal.quantity_limit} claimed
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-[#febd69] transition-all"
                style={{ width: progress + '%' }}
              />
            </div>
          </div>
        )}

        <dl className="text-xs space-y-1 pt-3 border-t mb-3">
          <div className="flex justify-between">
            <dt className="text-gray-500">Start</dt>
            <dd className="text-gray-900">{start.toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">End</dt>
            <dd className="text-gray-900">{end.toLocaleDateString()}</dd>
          </div>
        </dl>

        {(tab === 'active' || tab === 'upcoming') && (
          <button
            onClick={onCancel}
            className="mt-auto text-xs border border-red-200 text-red-700 hover:bg-red-50 py-1.5 rounded flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Cancel deal
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab, onCreate }) {
  const messages = {
    active: 'No active deals. Create one to boost visibility.',
    upcoming: 'No upcoming deals scheduled.',
    completed: 'No completed deals yet.',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
      <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">{messages[tab]}</h3>
      {tab === 'active' && (
        <button
          onClick={onCreate}
          className="mt-4 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create your first deal
        </button>
      )}
    </div>
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Create Deal</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
                  {p.title} — ${Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {product && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current price</span>
                <span className="font-medium text-gray-900">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Deal price
            </label>
            <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="0.01"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                placeholder="39.99"
                className="flex-1 text-sm focus:outline-none"
              />
            </div>
            {discountPct > 0 && (
              <p className="text-xs text-green-700 mt-1">
                That's <strong>{discountPct}% off</strong> the original price.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Quantity limit
            </label>
            <input
              type="number"
              value={quantityLimit}
              onChange={(e) => setQuantityLimit(e.target.value)}
              placeholder="100"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum units sold at the deal price.
            </p>
          </div>

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
              {saving ? 'Creating…' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}