import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Store,
  Check,
  Trash2,
  Shield,
  X,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getConnectedApps, revokeApp } from '../../../services/sellerService'

export default function ManageApps() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmRevoke, setConfirmRevoke] = useState(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const list = await getConnectedApps(user.id)
      setApps(list)
    } catch (err) {
      pushToast('Could not load apps', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  async function handleRevoke(app) {
    try {
      await revokeApp(user.id, app.app_id)
      pushToast(`${app.app_name} access revoked`, { type: 'info' })
      setConfirmRevoke(null)
      await load()
    } catch (err) {
      pushToast('Could not revoke access', { type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/apps-services"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Manage Your Apps</h1>
          <p className="text-sm text-gray-600">
            Apps with access to your seller account. Revoke access at any time.
          </p>
        </div>
        <button
          onClick={load}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 flex gap-3">
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Tip:</strong> Review your connected apps periodically. Revoke
          access for anything you don't recognize or no longer use.
        </div>
      </div>

      {/* Apps list */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading connected apps…
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No connected apps
          </h3>
          <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
            Apps you authorize from the Selling Partner Appstore will appear here.
          </p>
          <Link
            to="/seller/apps-services/appstore"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            <Package className="w-4 h-4" /> Browse the Appstore
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#232f3e] to-[#37475a] flex items-center justify-center text-white font-bold flex-shrink-0">
                {a.app_name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{a.app_name}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  by {a.app_developer || 'Unknown'} · {a.app_category || 'General'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Connected{' '}
                  {new Date(a.connected_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(a.permissions || []).map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                    >
                      <Check className="w-3 h-3 inline mr-1 text-green-600" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col gap-2 flex-shrink-0">
                <Link
                  to={`/seller/apps-services/app/${a.app_id}`}
                  className="flex-1 md:flex-none text-center text-sm px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded"
                >
                  View
                </Link>
                <button
                  onClick={() => setConfirmRevoke(a)}
                  className="flex-1 md:flex-none text-sm px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revoke confirmation modal */}
      {confirmRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmRevoke(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h2 className="font-bold text-gray-900">Revoke access?</h2>
              </div>
              <button
                onClick={() => setConfirmRevoke(null)}
                className="p-1.5 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                <strong>{confirmRevoke.app_name}</strong> will lose access to your
                seller account. Any active syncs or integrations will stop.
              </p>
              <p className="text-xs text-gray-500">
                You can reconnect it later from the Appstore.
              </p>
            </div>

            <div className="border-t px-5 py-3 flex justify-end gap-3">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(confirmRevoke)}
                className="bg-red-600 hover:bg-red-500 text-white font-medium px-5 py-2 rounded text-sm transition"
              >
                Revoke access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}