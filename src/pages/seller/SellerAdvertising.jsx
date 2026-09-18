import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  RefreshCw,
  Megaphone,
  Pause,
  Play,
  Trash2,
  X,
  Target,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerCampaigns,
  createCampaign,
  toggleCampaignStatus,
  deleteCampaign,
  getSellerProducts,
} from '../../services/sellerService'

const TYPE_LABELS = {
  sponsored_product: 'Sponsored Products',
  sponsored_brand: 'Sponsored Brands',
  display: 'Display',
}

export default function SellerAdvertising() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [campaigns, setCampaigns] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const [c, p] = await Promise.all([
        getSellerCampaigns(user.id),
        getSellerProducts(user.id),
      ])
      setCampaigns(c)
      setProducts(p)
    } catch (err) {
      pushToast('Could not load campaigns', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return campaigns
    return campaigns.filter((c) => c.status === statusFilter)
  }, [campaigns, statusFilter])

  // Aggregate totals
  const totals = useMemo(() => {
    const t = { impressions: 0, clicks: 0, spend: 0, sales: 0 }
    for (const c of campaigns.filter((c) => c.status === 'active')) {
      t.impressions += c.metrics.impressions
      t.clicks += c.metrics.clicks
      t.spend += c.metrics.spend
      t.sales += c.metrics.sales
    }
    return {
      ...t,
      roas: t.spend > 0 ? +(t.sales / t.spend).toFixed(2) : 0,
    }
  }, [campaigns])

  async function handleToggle(c) {
    const next = c.status === 'active' ? 'paused' : 'active'
    try {
      await toggleCampaignStatus(user.id, c.id, next)
      pushToast('Campaign ' + next, { type: 'info' })
      load()
    } catch {
      pushToast('Could not update campaign', { type: 'error' })
    }
  }

  async function handleDelete(c) {
    if (!confirm('Delete campaign "' + c.name + '"?')) return
    try {
      await deleteCampaign(user.id, c.id)
      pushToast('Campaign deleted', { type: 'info' })
      load()
    } catch {
      pushToast('Could not delete', { type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-sm text-gray-600">
            Run Sponsored Products, Brands, and Display ads. Metrics are simulated.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="Impressions" value={totals.impressions.toLocaleString()} icon={Eye} />
        <KPI label="Clicks" value={totals.clicks.toLocaleString()} icon={MousePointerClick} />
        <KPI label="Spend" value={'$' + totals.spend.toFixed(2)} icon={DollarSign} />
        <KPI label="Sales" value={'$' + totals.sales.toFixed(2)} icon={TrendingUp} />
        <KPI label="ROAS" value={totals.roas + '×'} icon={Target} highlight />
      </div>

      {/* Filter row */}
      <div className="flex gap-1 border-b">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'paused', label: 'Paused' },
          { id: 'ended', label: 'Ended' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ' +
              (statusFilter === f.id
                ? 'border-[#c7511f] text-[#c7511f]'
                : 'border-transparent text-gray-600 hover:text-gray-900')
            }
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="text-xs ml-1 text-gray-500">
                ({campaigns.filter((c) => c.status === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">Loading campaigns…</div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Campaign</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Budget/day</th>
                  <th className="text-right px-4 py-3">Impressions</th>
                  <th className="text-right px-4 py-3">Clicks</th>
                  <th className="text-right px-4 py-3">Spend</th>
                  <th className="text-right px-4 py-3">Sales</th>
                  <th className="text-right px-4 py-3">ROAS</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.product?.image_url ? (
                          <img
                            src={c.product.image_url}
                            alt=""
                            className="w-9 h-9 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center">
                            <Megaphone className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate max-w-[220px]">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[220px]">
                            {c.product?.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {TYPE_LABELS[c.campaign_type]}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          'inline-block text-xs font-medium px-2 py-0.5 rounded-full ' +
                          (c.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : c.status === 'paused'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600')
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ${Number(c.daily_budget).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {c.metrics.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {c.metrics.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      ${c.metrics.spend.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      ${c.metrics.sales.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          'font-bold ' +
                          (c.metrics.roas >= 3
                            ? 'text-green-700'
                            : c.metrics.roas >= 1
                            ? 'text-gray-900'
                            : 'text-red-600')
                        }
                      >
                        {c.metrics.roas}×
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(c)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title={c.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {c.status === 'active' ? (
                            <Pause className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCampaignModal
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

function KPI({ label, value, icon: Icon, highlight }) {
  return (
    <div
      className={
        'rounded-lg border p-4 ' +
        (highlight ? 'border-[#febd69] bg-orange-50' : 'border-gray-200 bg-white')
      }
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div
        className={
          'text-2xl font-bold ' + (highlight ? 'text-[#c7511f]' : 'text-gray-900')
        }
      >
        {value}
      </div>
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="p-12 text-center">
      <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">No campaigns yet</h3>
      <p className="text-sm text-gray-600 mb-4">
        Create a Sponsored Products campaign to start driving traffic.
      </p>
      <button
        onClick={onCreate}
        className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Create your first campaign
      </button>
    </div>
  )
}

function CreateCampaignModal({ products, onClose, onCreated }) {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [type, setType] = useState('sponsored_product')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [dailyBudget, setDailyBudget] = useState('20')
  const [bid, setBid] = useState('0.75')
  const [targeting, setTargeting] = useState('auto')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const product = products.find((p) => p.id === productId)
  const autoName = product ? `${product.title} — ${TYPE_LABELS[type]}` : ''

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productId) return setError('Select a product')
    if (!dailyBudget || Number(dailyBudget) <= 0)
      return setError('Daily budget must be greater than 0')
    if (!bid || Number(bid) <= 0) return setError('Bid must be greater than 0')

    setSaving(true)
    setError(null)
    try {
      await createCampaign(user.id, {
        product_id: productId,
        name: name.trim() || autoName,
        campaign_type: type,
        daily_budget: dailyBudget,
        bid,
        targeting,
      })
      pushToast('Campaign launched', { type: 'success' })
      onCreated()
    } catch (err) {
      setError(err.message || 'Could not create campaign')
    } finally {
      setSaving(false)
    }
  }

  const TYPES = [
    { id: 'sponsored_product', label: 'Sponsored Products', desc: 'Promote individual products in search results.' },
    { id: 'sponsored_brand', label: 'Sponsored Brands', desc: 'Showcase a brand with a headline and logo.' },
    { id: 'display', label: 'Display', desc: 'Reach shoppers across the web and apps.' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Create Campaign</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Campaign type
            </label>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={
                    'w-full text-left px-4 py-3 rounded-lg border-2 transition ' +
                    (type === t.id
                      ? 'border-[#c7511f] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-400 bg-white')
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center ' +
                        (type === t.id ? 'border-[#c7511f]' : 'border-gray-300')
                      }
                    >
                      {type === t.id && (
                        <span className="w-2 h-2 rounded-full bg-[#c7511f]" />
                      )}
                    </span>
                    <span className="font-medium text-gray-900">{t.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

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

          {/* Budget + bid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Daily budget
              </label>
              <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="flex-1 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Bid per click
              </label>
              <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                  className="flex-1 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Targeting
            </label>
            <div className="flex gap-2">
              {['auto', 'manual'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargeting(t)}
                  className={
                    'flex-1 px-3 py-2 rounded border text-sm capitalize ' +
                    (targeting === t
                      ? 'border-[#c7511f] bg-orange-50 text-[#c7511f] font-medium'
                      : 'border-gray-300 hover:border-gray-400')
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {targeting === 'auto'
                ? 'Amazon targets relevant keywords for you.'
                : 'You choose keywords and bids manually.'}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Campaign name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={autoName}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to auto-generate.
            </p>
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
              {saving ? 'Launching…' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}