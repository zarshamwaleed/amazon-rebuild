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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const TYPE_LABELS = {
  sponsored_product: 'Sponsored Products',
  sponsored_brand: 'Sponsored Brands',
  display: 'Display',
}

const STATUS_BADGE = {
  active: 'green',
  paused: 'gray',
  ended: 'gray',
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
    } catch {
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
      <SellerPageHeader
        title="Campaign Manager"
        description="Run Sponsored Products, Brands, and Display ads. Metrics are simulated."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create Campaign
            </Button>
            <Button variant="outline" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SellerStatCard label="Impressions" value={totals.impressions.toLocaleString()} icon={Eye} />
        <SellerStatCard label="Clicks" value={totals.clicks.toLocaleString()} icon={MousePointerClick} />
        <SellerStatCard label="Spend" value={'$' + totals.spend.toFixed(2)} icon={DollarSign} />
        <SellerStatCard label="Sales" value={'$' + totals.sales.toFixed(2)} icon={TrendingUp} />
        <SellerStatCard label="ROAS" value={totals.roas + '×'} icon={Target} />
      </div>

      {/* Filter row */}
      <div className="flex gap-1 border-b border-stone-200">
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
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo ' +
              (statusFilter === f.id
                ? 'border-brass-500 text-brass-700'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900')
            }
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="text-xs ml-1 text-charcoal-400">
                ({campaigns.filter((c) => c.status === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            message="Create a Sponsored Products campaign to start driving traffic."
            action={
              <Button variant="secondary" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Create your first campaign
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Campaign</th>
                  <th className="text-label text-left px-4 py-3">Type</th>
                  <th className="text-label text-center px-4 py-3">Status</th>
                  <th className="text-label text-right px-4 py-3">Budget/day</th>
                  <th className="text-label text-right px-4 py-3">Impressions</th>
                  <th className="text-label text-right px-4 py-3">Clicks</th>
                  <th className="text-label text-right px-4 py-3">Spend</th>
                  <th className="text-label text-right px-4 py-3">Sales</th>
                  <th className="text-label text-right px-4 py-3">ROAS</th>
                  <th className="text-label text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-avenzo">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {c.product?.image_url ? (
                          <img
                            src={c.product.image_url}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                            <Megaphone className="w-4 h-4 text-charcoal-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-charcoal-900 truncate max-w-[220px]">
                            {c.name}
                          </div>
                          <div className="text-xs text-charcoal-500 truncate max-w-[220px]">
                            {c.product?.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-charcoal-700">
                      {TYPE_LABELS[c.campaign_type]}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge color={STATUS_BADGE[c.status] || 'gray'}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right text-charcoal-900">
                      ${Number(c.daily_budget).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-charcoal-700">
                      {c.metrics.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-charcoal-700">
                      {c.metrics.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-charcoal-700">
                      ${c.metrics.spend.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-charcoal-900 font-medium">
                      ${c.metrics.sales.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={
                          'font-semibold ' +
                          (c.metrics.roas >= 3
                            ? 'text-success-700'
                            : c.metrics.roas >= 1
                            ? 'text-charcoal-900'
                            : 'text-error-600')
                        }
                      >
                        {c.metrics.roas}×
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(c)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                          title={c.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {c.status === 'active' ? (
                            <Pause className="w-4 h-4 text-charcoal-600" />
                          ) : (
                            <Play className="w-4 h-4 text-charcoal-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 hover:bg-error-50 rounded-lg transition-avenzo"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-error-600" />
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
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted border border-stone-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
          <h2 className="heading-sub">Create Campaign</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-label mb-2">Campaign type</label>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={
                    'w-full text-left px-4 py-3 rounded-lg border-2 transition-avenzo ' +
                    (type === t.id
                      ? 'border-brass-400 bg-brass-50'
                      : 'border-stone-200 hover:border-stone-300 bg-bone-50')
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' +
                        (type === t.id ? 'border-brass-500' : 'border-stone-300')
                      }
                    >
                      {type === t.id && <span className="w-2 h-2 rounded-full bg-brass-500" />}
                    </span>
                    <span className="font-medium text-charcoal-900">{t.label}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 ml-6 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="block text-label mb-1.5">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm bg-bone-50 text-charcoal-900 focus:outline-none focus:border-brass-400 transition-avenzo"
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
            <Input
              label="Daily budget (USD)"
              type="number"
              step="0.01"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
            />
            <Input
              label="Bid per click (USD)"
              type="number"
              step="0.01"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
            />
          </div>

          {/* Targeting */}
          <div>
            <label className="block text-label mb-1.5">Targeting</label>
            <div className="flex gap-2">
              {['auto', 'manual'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargeting(t)}
                  className={
                    'flex-1 px-3 py-2 rounded-lg border text-sm capitalize transition-avenzo ' +
                    (targeting === t
                      ? 'border-brass-400 bg-brass-50 text-brass-700 font-medium'
                      : 'border-stone-300 hover:border-stone-400 text-charcoal-700')
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-caption mt-1.5">
              {targeting === 'auto'
                ? 'Amazon targets relevant keywords for you.'
                : 'You choose keywords and bids manually.'}
            </p>
          </div>

          {/* Name */}
          <Input
            label="Campaign name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={autoName}
            hint="Leave blank to auto-generate."
          />

          {error && (
            <div className="text-body-sm text-error-700 bg-error-50 border border-error-500/25 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" loading={saving}>
              Launch Campaign
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
