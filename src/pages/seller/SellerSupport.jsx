import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  HelpCircle,
  ChevronDown,
  Plus,
  X,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Package,
  Box,
  DollarSign,
  Truck,
  Megaphone,
  FileCheck2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSupportCases,
  createSupportCase,
  closeSupportCase,
} from '../../services/sellerService'
import { SUPPORT_CATEGORIES, searchFaqs } from '../../data/sellerFaqs'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'

const CATEGORY_ICONS = {
  account: User,
  products: Package,
  orders: Package,
  inventory: Box,
  payments: DollarSign,
  shipping: Truck,
  advertising: Megaphone,
  policies: FileCheck2,
}

const STATUS_STYLES = {
  open: { label: 'Open', color: 'blue', icon: Clock },
  pending: { label: 'Pending', color: 'yellow', icon: Clock },
  resolved: { label: 'Resolved', color: 'green', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'gray', icon: CheckCircle2 },
}

export default function SellerSupport() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [cases, setCases] = useState([])
  const [loadingCases, setLoadingCases] = useState(true)

  async function loadCases() {
    if (!user) return
    try {
      setLoadingCases(true)
      const c = await getSupportCases(user.id)
      setCases(c)
    } catch {
      pushToast('Could not load support cases', { type: 'error' })
    } finally {
      setLoadingCases(false)
    }
  }

  useEffect(() => {
    loadCases()
    // Auto-refresh every 8s so simulated support responses appear
    const t = setInterval(() => {
      loadCases()
    }, 8000)
    return () => clearInterval(t)
  }, [user])

  const faqs = useMemo(() => searchFaqs(query, category), [query, category])

  async function handleClose(caseId) {
    try {
      await closeSupportCase(user.id, caseId)
      pushToast('Case closed', { type: 'info' })
      loadCases()
    } catch {
      pushToast('Could not close case', { type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Help & Support"
        description="Search for answers or open a support case."
      />

      {/* Search */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles and FAQs…"
          className="flex-1 text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      {/* Categories */}
      <section>
        <h2 className="heading-section mb-3">Browse categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CategoryTile
            label="All categories"
            description="Show all articles"
            icon={HelpCircle}
            active={category === null}
            onClick={() => setCategory(null)}
          />
          {SUPPORT_CATEGORIES.map((c) => (
            <CategoryTile
              key={c.id}
              label={c.label}
              description={c.description}
              icon={CATEGORY_ICONS[c.id] || HelpCircle}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
            />
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="heading-section">
            {category
              ? SUPPORT_CATEGORIES.find((c) => c.id === category)?.label + ' FAQs'
              : 'Frequently asked questions'}
          </h2>
          <span className="text-caption">
            {faqs.length} article{faqs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {faqs.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No matching articles"
            message="Try a different search, or open a support case below."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Open a support case
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {faqs.map((f) => {
              const open = openFaq === f.id
              const cat = SUPPORT_CATEGORIES.find((c) => c.id === f.category)
              return (
                <div
                  key={f.id}
                  className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : f.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-stone-50 transition-avenzo"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-charcoal-900">{f.question}</div>
                      <div className="text-xs text-charcoal-500 mt-0.5">{cat?.label}</div>
                    </div>
                    <ChevronDown
                      className={
                        'w-4 h-4 text-charcoal-500 transition-transform flex-shrink-0 ' +
                        (open ? 'rotate-180' : '')
                      }
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 pt-1 text-sm text-charcoal-700 border-t border-stone-200 bg-stone-50/60">
                      {f.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Create case CTA */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-brass-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-charcoal-900">Still need help?</div>
            <div className="text-body-sm">
              Open a support case and our team will respond within 24 hours.
            </div>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create support case
        </Button>
      </div>

      {/* Case history */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="heading-section">Your support cases</h2>
          <button
            onClick={loadCases}
            className="text-xs font-medium text-brass-600 hover:text-brass-700 transition-avenzo flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loadingCases ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No support cases"
            message="Your case history will appear here."
          />
        ) : (
          <div className="space-y-3">
            {cases.map((c) => {
              const status = STATUS_STYLES[c.status] || STATUS_STYLES.open
              const StatusIcon = status.icon
              const cat = SUPPORT_CATEGORIES.find((x) => x.id === c.category)
              return (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge color={status.color}>
                          <StatusIcon className="w-3 h-3" /> {status.label}
                        </Badge>
                        <span className="text-caption">{cat?.label}</span>
                        <span className="text-xs text-charcoal-400 font-mono">
                          #{c.id.slice(0, 8)}
                        </span>
                      </div>
                      <h3 className="font-medium text-charcoal-900">{c.subject}</h3>
                      <p className="text-body-sm mt-1 whitespace-pre-line">{c.message}</p>

                      {c.response && (
                        <div className="mt-3 bg-info-50 border border-info-500/20 rounded-lg p-3 text-sm text-info-700">
                          <div className="text-xs font-bold uppercase tracking-wider mb-1">
                            Support response
                          </div>
                          {c.response}
                        </div>
                      )}

                      <div className="text-xs text-charcoal-400 mt-2">
                        Opened {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>

                    {c.status !== 'closed' && (
                      <Button variant="outline" size="sm" onClick={() => handleClose(c.id)}>
                        Close case
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {showCreate && (
        <CreateCaseModal
          defaultCategory={category}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            loadCases()
            pushToast('Support case opened', { type: 'success' })
          }}
        />
      )}
    </div>
  )
}

function CategoryTile({ label, description, icon, active, onClick }) {
  const Icon = icon
  return (
    <button onClick={onClick} className="text-left w-full">
      <Card
        hoverable
        padding="sm"
        className={active ? 'border-brass-400 ring-1 ring-brass-400/30' : ''}
      >
        <Icon className={'w-5 h-5 mb-2 ' + (active ? 'text-brass-600' : 'text-charcoal-400')} />
        <div className="text-sm font-medium text-charcoal-900">{label}</div>
        <div className="text-xs text-charcoal-500 mt-0.5 line-clamp-2">{description}</div>
      </Card>
    </button>
  )
}

function CreateCaseModal({ defaultCategory, onClose, onCreated }) {
  const { user } = useAuth()

  const [category, setCategory] = useState(defaultCategory || 'account')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!subject.trim()) return setError('Subject is required')
    if (!message.trim()) return setError('Please describe your issue')

    setSaving(true)
    setError(null)
    try {
      await createSupportCase(user.id, {
        category,
        subject: subject.trim(),
        message: message.trim(),
        order_id: orderId.trim() || null,
      })
      onCreated()
    } catch (err) {
      setError(err.message || 'Could not create case')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted border border-stone-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
          <h2 className="heading-sub">Create support case</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-label mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
            >
              {SUPPORT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
          />

          <Input
            label="Related order ID (optional)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 01f68e11-c100-45dd-af41-..."
            className="font-mono"
          />

          <div>
            <label className="block text-label mb-1.5">Describe your issue</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include as much detail as possible — screenshots, order IDs, error messages."
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
          </div>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Opening case…' : 'Open case'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
