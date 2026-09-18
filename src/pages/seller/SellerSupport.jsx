import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
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
  open: { label: 'Open', cls: 'bg-blue-100 text-blue-800', icon: Clock },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  resolved: { label: 'Resolved', cls: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  closed: { label: 'Closed', cls: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
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

  const faqs = useMemo(
    () => searchFaqs(query, category),
    [query, category]
  )

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
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Help & Support
        </h1>
        <p className="text-gray-200 mb-5">
          Search for answers or open a support case.
        </p>
        <div className="flex items-stretch rounded overflow-hidden max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles and FAQs..."
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
          />
          <button
            type="button"
            className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Browse categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CategoryTile
            id={null}
            label="All categories"
            description="Show all articles"
            icon={HelpCircle}
            active={category === null}
            onClick={() => setCategory(null)}
          />
          {SUPPORT_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.id] || HelpCircle
            return (
              <CategoryTile
                key={c.id}
                id={c.id}
                label={c.label}
                description={c.description}
                icon={Icon}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              />
            )
          })}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            {category
              ? SUPPORT_CATEGORIES.find((c) => c.id === category)?.label +
                ' FAQs'
              : 'Frequently asked questions'}
          </h2>
          <span className="text-xs text-gray-500">
            {faqs.length} article{faqs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {faqs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              No matching articles
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Try a different search, or open a support case below.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Open a support case
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((f) => {
              const open = openFaq === f.id
              const cat = SUPPORT_CATEGORIES.find((c) => c.id === f.category)
              return (
                <div
                  key={f.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : f.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {f.question}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {cat?.label}
                      </div>
                    </div>
                    <ChevronDown
                      className={
                        'w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ' +
                        (open ? 'rotate-180' : '')
                      }
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 pt-1 text-sm text-gray-700 border-t bg-gray-50/60">
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
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#c7511f]" />
          <div>
            <div className="font-bold text-gray-900">Still need help?</div>
            <div className="text-sm text-gray-600">
              Open a support case and our team will respond within 24 hours.
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Create support case
        </button>
      </div>

      {/* Case history */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Your support cases</h2>
          <button
            onClick={loadCases}
            className="text-xs text-[#007185] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loadingCases ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-600">
            Loading cases…
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No support cases</h3>
            <p className="text-sm text-gray-600">
              Your case history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => {
              const status = STATUS_STYLES[c.status] || STATUS_STYLES.open
              const Icon = status.icon
              const cat = SUPPORT_CATEGORIES.find((x) => x.id === c.category)
              return (
                <div
                  key={c.id}
                  className="bg-white border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={
                            'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ' +
                            status.cls
                          }
                        >
                          <Icon className="w-3 h-3" /> {status.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {cat?.label}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          #{c.id.slice(0, 8)}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{c.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                        {c.message}
                      </p>

                      {c.response && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                          <div className="text-xs font-bold uppercase tracking-wider mb-1">
                            Support response
                          </div>
                          {c.response}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        Opened {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>

                    {c.status !== 'closed' && (
                      <button
                        onClick={() => handleClose(c.id)}
                        className="text-xs border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded"
                      >
                        Close case
                      </button>
                    )}
                  </div>
                </div>
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

function CategoryTile({ label, description, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'text-left bg-white border rounded-lg p-4 hover:shadow-sm transition ' +
        (active ? 'border-[#c7511f] ring-1 ring-[#c7511f]/30' : 'border-gray-200')
      }
    >
      <Icon
        className={
          'w-5 h-5 mb-2 ' + (active ? 'text-[#c7511f]' : 'text-gray-500')
        }
      />
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</div>
    </button>
  )
}

function CreateCaseModal({ defaultCategory, onClose, onCreated }) {
  const { user } = useAuth()
  const { pushToast } = useToast()

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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Create support case</h2>
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
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {SUPPORT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Related order ID (optional)
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 01f68e11-c100-45dd-af41-..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Describe your issue
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include as much detail as possible — screenshots, order IDs, error messages."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
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
              {saving ? 'Opening case…' : 'Open case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}