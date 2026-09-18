import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Eye,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getGrowthOpportunity,
  updateOpportunityStatus,
} from '../../services/sellerService'

const STATUS_META = {
  new: { label: 'New', cls: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In progress', cls: 'bg-amber-100 text-amber-800', icon: Zap },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  dismissed: { label: 'Dismissed', cls: 'bg-gray-100 text-gray-600', icon: XCircle },
}

const IMPACT_META = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-gray-100 text-gray-700',
}

export default function SellerGrowthOpportunity() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [opp, setOpp] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user || !id) return
    try {
      setLoading(true)
      const data = await getGrowthOpportunity(user.id, id)
      setOpp(data)
    } catch (err) {
      pushToast('Could not load opportunity', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user, id])

  async function setStatus(status) {
    try {
      await updateOpportunityStatus(user.id, id, status)
      pushToast('Status updated', { type: 'success' })
      load()
    } catch {
      pushToast('Could not update status', { type: 'error' })
    }
  }

  async function handleTakeAction() {
    if (!opp) return
    // Mark in-progress if currently new
    if (opp.status === 'new') {
      await updateOpportunityStatus(user.id, id, 'in_progress')
    }
    if (opp.action_link) {
      navigate(opp.action_link)
    } else {
      pushToast(opp.recommended_action + ' — coming soon', { type: 'info' })
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading opportunity…</div>
  }

  if (!opp) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">Opportunity not found</h3>
        <p className="text-sm text-gray-600 mb-4">
          This opportunity doesn't exist or was dismissed.
        </p>
        <Link
          to="/seller/growth"
          className="text-[#007185] hover:underline text-sm"
        >
          ← Back to Growth
        </Link>
      </div>
    )
  }

  const status = STATUS_META[opp.status] || STATUS_META.new
  const StatusIcon = status.icon

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/growth"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-sm text-gray-600">Opportunity</span>
      </div>

      {/* Hero */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-[#c7511f]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                {opp.category}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {opp.title}
              </h1>
              {opp.product_title && (
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  {opp.product_image && (
                    <img
                      src={opp.product_image}
                      alt=""
                      className="w-5 h-5 rounded object-cover border"
                    />
                  )}
                  {opp.product_title}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                'text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ' +
                status.cls
              }
            >
              <StatusIcon className="w-3.5 h-3.5" /> {status.label}
            </span>
            <span
              className={
                'text-xs font-medium px-3 py-1 rounded-full ' +
                IMPACT_META[opp.impact]
              }
            >
              {opp.impact} impact
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{opp.description}</p>
      </div>

      {/* Why we're recommending this */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" /> Why we're recommending this
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {whyText(opp)}
        </p>
      </section>

      {/* Current performance */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Current performance
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <MetricTile label="Views" value={sessionsFor(opp).toLocaleString()} icon={Eye} />
          <MetricTile
            label="Conversion"
            value={opp.impact === 'High' ? '2.4%' : '3.8%'}
            icon={TrendingUp}
          />
          <MetricTile
            label="Estimated lift"
            value={'$' + Math.round(Number(opp.estimated_value)).toLocaleString()}
            icon={DollarSign}
            tone="green"
          />
        </div>
      </section>

      {/* Recommended actions */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Recommended actions
        </h2>
        <ul className="space-y-2">
          {recommendedSteps(opp).map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Action bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Estimated impact:{' '}
          <strong className="text-gray-900">
            ${Math.round(Number(opp.estimated_value)).toLocaleString()}
          </strong>
        </div>
        <div className="flex flex-wrap gap-2">
          {opp.status === 'completed' ? (
            <button
              onClick={() => setStatus('in_progress')}
              className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm"
            >
              Reopen
            </button>
          ) : (
            <>
              <button
                onClick={() => setStatus('dismissed')}
                className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm"
              >
                Dismiss
              </button>
              <button
                onClick={() => setStatus('completed')}
                className="border border-green-300 text-green-700 hover:bg-green-50 px-4 py-2 rounded text-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark complete
              </button>
              <button
                onClick={handleTakeAction}
                className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm transition"
              >
                {opp.recommended_action} →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricTile({ label, value, icon: Icon, tone }) {
  const toneCls =
    tone === 'green' ? 'text-green-700' : 'text-gray-900'
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-500">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className={'text-xl font-bold ' + toneCls}>{value}</div>
    </div>
  )
}

function whyText(opp) {
  const cat = opp.category
  if (cat === 'Improve Sales') {
    return `Your product "${opp.product_title}" receives meaningful traffic but its conversion rate is below the benchmark for its category. Improving listing quality — images, bullets, and description — is typically the fastest way to lift sales.`
  }
  if (cat === 'Drive Traffic') {
    return `Traffic to "${opp.product_title}" is low relative to its category demand. Running Sponsored Products is the fastest way to increase visibility and generate incremental sales while you optimize organically.`
  }
  if (cat === 'Reduce Cost') {
    return `You're holding more inventory than sells through in a typical period, which increases storage and tied-up capital. Reducing excess or promoting the product can improve cash flow.`
  }
  if (cat === 'Sell New Products') {
    return `Your catalog is small relative to category demand. Adding complementary SKUs increases the chance of capturing more of your existing shoppers' spend.`
  }
  return `This opportunity was flagged based on your current product, order, and traffic data. Taking action now should improve your business metrics over the coming weeks.`
}

function recommendedSteps(opp) {
  const cat = opp.category
  if (cat === 'Improve Sales') {
    return ['Improve title', 'Add or replace product images', 'Refine bullet points', 'Add A+ Content']
  }
  if (cat === 'Drive Traffic') {
    return ['Create a Sponsored Products campaign', 'Set a daily budget of $20–$30', 'Target category keywords', 'Monitor ACOS weekly']
  }
  if (cat === 'Reduce Cost') {
    return ['Review pricing', 'Create a promotional deal', 'Consider removing aged inventory', 'Reduce inbound shipments']
  }
  if (cat === 'Sell New Products') {
    return ['Research adjacent categories', 'Add a new SKU with strong demand', 'Test with a small initial inventory', 'Track conversion weekly']
  }
  return ['Review the recommendation', 'Take the suggested action', 'Mark complete when done']
}

function sessionsFor(opp) {
  // Stable pseudo value based on estimated value
  return Math.max(500, Math.round(Number(opp.estimated_value) * 12))
}