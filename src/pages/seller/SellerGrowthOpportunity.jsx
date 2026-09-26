import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Lightbulb,
  TrendingUp,
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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import NumberTicker from '../../components/NumberTicker'

const STATUS_META = {
  new: { label: 'New', color: 'blue', icon: Clock },
  in_progress: { label: 'In progress', color: 'yellow', icon: Zap },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
  dismissed: { label: 'Dismissed', color: 'gray', icon: XCircle },
}

const IMPACT_COLOR = { High: 'red', Medium: 'yellow', Low: 'gray' }

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
      console.error('[getGrowthOpportunity]', err)
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
    return (
      <div className="space-y-5 max-w-4xl animate-fade-in">
        <div className="h-8 w-40 rounded-lg skeleton-shimmer" />
        <div className="h-40 rounded-xl skeleton-shimmer" />
        <div className="h-32 rounded-xl skeleton-shimmer" />
      </div>
    )
  }

  if (!opp) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Opportunity not found"
        message="This opportunity doesn't exist or was dismissed."
        action={
          <Link to="/seller/growth" className="text-sm text-brass-600 hover:text-brass-700 transition-avenzo">
            ← Back to Growth
          </Link>
        }
      />
    )
  }

  const status = STATUS_META[opp.status] || STATUS_META.new
  const StatusIcon = status.icon

  return (
    <div className="space-y-5 max-w-4xl">
      <SellerPageHeader title="Opportunity" backTo="/seller/growth" />

      {/* Hero */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-brass-50 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-brass-600" />
            </div>
            <div>
              <div className="text-label mb-1">{opp.category}</div>
              <h1 className="heading-page">{opp.title}</h1>
              {opp.product_title && (
                <div className="text-sm text-charcoal-600 mt-1 flex items-center gap-2">
                  {opp.product_image && (
                    <img src={opp.product_image} alt="" className="w-5 h-5 rounded object-cover border border-stone-200" />
                  )}
                  {opp.product_title}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={status.color}>
              <StatusIcon className="w-3.5 h-3.5" /> {status.label}
            </Badge>
            <Badge color={IMPACT_COLOR[opp.impact]}>{opp.impact} impact</Badge>
          </div>
        </div>

        <p className="text-sm text-charcoal-700 leading-relaxed">{opp.description}</p>
      </Card>

      {/* Why we're recommending this */}
      <Card title="Why we're recommending this" actions={<Target className="w-4 h-4 text-charcoal-400" />}>
        <p className="text-sm text-charcoal-700 leading-relaxed">{whyText(opp)}</p>
      </Card>

      {/* Current performance */}
      <Card title="Current performance" actions={<BarChart3 className="w-4 h-4 text-charcoal-400" />}>
        <div className="grid grid-cols-3 gap-4">
          <MetricTile
            label="Views"
            value={<NumberTicker value={sessionsFor(opp)} formatter={(n) => Math.round(n).toLocaleString()} />}
            icon={Eye}
          />
          <MetricTile
            label="Conversion"
            value={
              <NumberTicker
                value={opp.impact === 'High' ? 2.4 : 3.8}
                formatter={(n) => n.toFixed(1) + '%'}
              />
            }
            icon={TrendingUp}
          />
          <MetricTile
            label="Estimated lift"
            value={
              <NumberTicker
                value={Math.round(Number(opp.estimated_value))}
                formatter={(n) => '$' + Math.round(n).toLocaleString()}
              />
            }
            icon={DollarSign}
            tone="green"
          />
        </div>
      </Card>

      {/* Recommended actions */}
      <Card title="Recommended actions" actions={<Zap className="w-4 h-4 text-charcoal-400" />}>
        <ul className="space-y-2">
          {recommendedSteps(opp).map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-charcoal-800">
              <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </Card>

      {/* Action bar */}
      <Card className="!shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-charcoal-500">
            Estimated impact:{' '}
            <strong className="text-charcoal-900">
              ${Math.round(Number(opp.estimated_value)).toLocaleString()}
            </strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {opp.status === 'completed' ? (
              <Button variant="outline" onClick={() => setStatus('in_progress')}>
                Reopen
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStatus('dismissed')}>
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  className="!border-success-500/40 !text-success-700 hover:!bg-success-50"
                  onClick={() => setStatus('completed')}
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark complete
                </Button>
                <Button variant="secondary" onClick={handleTakeAction}>
                  {opp.recommended_action} →
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function MetricTile({ label, value, icon, tone }) {
  const Icon = icon
  const toneCls = tone === 'green' ? 'text-success-700' : 'text-charcoal-900'
  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-label">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
      </div>
      <div className={'text-xl font-semibold ' + toneCls}>{value}</div>
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
