import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star, Check, Shield, X, ExternalLink } from 'lucide-react'
import { getAppById } from '../../../data/sellerApps'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getConnectedApps, connectApp } from '../../../services/sellerService'
import SellerPageHeader from '../../../components/seller/SellerPageHeader'
import Card from '../../../components/Card'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const app = getAppById(id)

  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authorizing, setAuthorizing] = useState(false)

  useEffect(() => {
    if (!user || !app) {
      setLoading(false)
      return
    }
    let cancelled = false
    getConnectedApps(user.id)
      .then((list) => {
        if (cancelled) return
        setConnected(list.some((a) => a.app_id === app.id))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, app])

  async function handleAuthorize() {
    if (!user || !app) return
    setAuthorizing(true)
    try {
      await connectApp(user.id, app)
      pushToast(`${app.name} connected successfully`, { type: 'success' })
      setConnected(true)
      setShowAuth(false)
    } catch {
      pushToast('Could not connect app', { type: 'error' })
    } finally {
      setAuthorizing(false)
    }
  }

  if (!app) {
    return (
      <EmptyState
        title="App not found"
        message="This app doesn't exist in the Appstore."
        action={
          <Link to="/seller/apps-services/appstore" className="text-brass-600 hover:text-brass-700 text-sm font-medium">
            ← Back to Appstore
          </Link>
        }
      />
    )
  }

  const initials = app.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="space-y-5">
      <SellerPageHeader title="App details" backTo="/seller/apps-services/appstore" />

      {/* Hero card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className={
              'w-20 h-20 rounded-xl bg-gradient-to-br ' +
              app.color +
              ' flex items-center justify-center text-white font-bold text-2xl flex-shrink-0'
            }
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="heading-page mb-1">{app.name}</h1>
            <p className="text-body-sm mb-2">by {app.developer}</p>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning-500 text-warning-500" />
                <span className="text-sm font-medium text-charcoal-900">{app.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-charcoal-500">{app.reviews.toLocaleString()} reviews</span>
              <span className="text-xs text-stone-300">|</span>
              <Badge color="gray">{app.category}</Badge>
            </div>

            <p className="text-body-sm leading-relaxed mb-4">{app.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              {connected ? (
                <Link to="/seller/apps-services/manage">
                  <Button variant="outline">
                    <Check className="w-4 h-4 text-success-600" />
                    Connected — Manage
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => (user ? setShowAuth(true) : navigate('/login'))}
                  disabled={loading}
                >
                  Add App
                </Button>
              )}
              <div className="text-lg font-semibold text-charcoal-900 ml-auto md:ml-0">{app.price}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="md:col-span-2 space-y-5">
          <Card title="Features">
            <ul className="space-y-2.5">
              {app.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-charcoal-800">
                  <Check className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title={
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-charcoal-500" /> Permissions requested
              </span>
            }
          >
            <p className="text-body-sm mb-4">
              This app will be able to access the following data from your seller account after you authorize it.
            </p>
            <div className="flex flex-wrap gap-2">
              {app.permissions.map((p) => (
                <Badge key={p} color="yellow" variant="chip">
                  {p}
                </Badge>
              ))}
            </div>
          </Card>

          <Card title="About the developer">
            <p className="text-body-sm mb-3">
              {app.developer} is an Amazon-approved Selling Partner Appstore developer.
            </p>
            <button
              type="button"
              onClick={() => pushToast('Developer profile — demo only', { type: 'info' })}
              className="text-sm font-medium text-brass-600 hover:text-brass-700 transition-avenzo flex items-center gap-1"
            >
              Visit developer site <ExternalLink className="w-3 h-3" />
            </button>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Card title="Pricing">
            <div className="font-display text-2xl text-charcoal-900 mb-1">{app.price}</div>
            <p className="text-xs text-charcoal-500">Cancel anytime</p>
          </Card>

          <Card title="Details">
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Category</dt>
                <dd className="text-charcoal-900">{app.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Rating</dt>
                <dd className="text-charcoal-900">{app.rating} / 5</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Reviews</dt>
                <dd className="text-charcoal-900">{app.reviews.toLocaleString()}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {/* Authorization modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-900/50" onClick={() => setShowAuth(false)} />
          <div className="relative bg-bone-50 rounded-xl shadow-lifted w-full max-w-md animate-scale-in">
            <div className="border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
              <h2 className="heading-sub">Connect {app.name}?</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-body-sm">This app will be able to access:</p>
              <ul className="space-y-2 bg-stone-50 border border-stone-200 rounded-lg p-3">
                {app.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-charcoal-800">
                    <Check className="w-4 h-4 text-success-600" /> {p}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-charcoal-500">
                You can revoke access at any time from <strong>Manage Your Apps</strong>.
              </p>
            </div>

            <div className="border-t border-stone-200 px-5 py-3.5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAuth(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleAuthorize} loading={authorizing}>
                {authorizing ? 'Authorizing…' : 'Authorize App'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
