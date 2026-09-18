import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Check,
  Shield,
  X,
  ExternalLink,
} from 'lucide-react'
import { getAppById } from '../../../data/sellerApps'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getConnectedApps, connectApp } from '../../../services/sellerService'

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
    } catch (err) {
      pushToast('Could not connect app', { type: 'error' })
    } finally {
      setAuthorizing(false)
    }
  }

  if (!app) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <h3 className="font-semibold text-gray-900 mb-1">App not found</h3>
        <p className="text-sm text-gray-600 mb-4">
          This app doesn't exist in the Appstore.
        </p>
        <Link
          to="/seller/apps-services/appstore"
          className="text-[#007185] hover:underline text-sm"
        >
          ← Back to Appstore
        </Link>
      </div>
    )
  }

  const initials = app.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/seller/apps-services/appstore"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-sm text-gray-600">App details</span>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{app.name}</h1>
            <p className="text-sm text-gray-600 mb-2">by {app.developer}</p>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffa41c] text-[#ffa41c]" />
                <span className="text-sm font-medium text-gray-900">
                  {app.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {app.reviews.toLocaleString()} reviews
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-700">{app.category}</span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {app.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {connected ? (
                <Link
                  to="/seller/apps-services/manage"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-5 py-2.5 rounded flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4 text-green-600" />
                  Connected — Manage
                </Link>
              ) : (
                <button
                  onClick={() => (user ? setShowAuth(true) : navigate('/login'))}
                  disabled={loading}
                  className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded text-sm disabled:opacity-60 transition"
                >
                  Add App
                </button>
              )}
              <div className="text-lg font-bold text-gray-900 ml-auto md:ml-0">
                {app.price}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="md:col-span-2 space-y-5">
          {/* Features */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Features</h2>
            <ul className="space-y-2.5">
              {app.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-gray-800">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* Permissions requested */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Permissions requested
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This app will be able to access the following data from your
              seller account after you authorize it.
            </p>
            <div className="flex flex-wrap gap-2">
              {app.permissions.map((p) => (
                <span
                  key={p}
                  className="text-xs font-medium bg-orange-50 border border-orange-200 text-[#c7511f] px-3 py-1 rounded-full"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>

          {/* About developer */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              About the developer
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              {app.developer} is an Amazon-approved Selling Partner Appstore
              developer.
            </p>
            <button
              type="button"
              onClick={() =>
                pushToast('Developer profile — demo only', { type: 'info' })
              }
              className="text-sm text-[#007185] hover:underline flex items-center gap-1"
            >
              Visit developer site <ExternalLink className="w-3 h-3" />
            </button>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-3">Pricing</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {app.price}
            </div>
            <p className="text-xs text-gray-600">Cancel anytime</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-3">Details</h3>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">{app.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Rating</dt>
                <dd className="text-gray-900">{app.rating} / 5</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Reviews</dt>
                <dd className="text-gray-900">
                  {app.reviews.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Authorization modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAuth(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b px-5 py-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                Connect {app.name}?
              </h2>
              <button
                onClick={() => setShowAuth(false)}
                className="p-1.5 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-700">
                This app will be able to access:
              </p>
              <ul className="space-y-2 bg-gray-50 border border-gray-200 rounded p-3">
                {app.permissions.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-gray-800"
                  >
                    <Check className="w-4 h-4 text-green-600" /> {p}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500">
                You can revoke access at any time from{' '}
                <strong>Manage Your Apps</strong>.
              </p>
            </div>

            <div className="border-t px-5 py-3 flex justify-end gap-3">
              <button
                onClick={() => setShowAuth(false)}
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorize}
                disabled={authorizing}
                className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-60 transition"
              >
                {authorizing ? 'Authorizing…' : 'Authorize App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}