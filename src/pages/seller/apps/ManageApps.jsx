import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Store, Check, Trash2, Shield, X, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getConnectedApps, revokeApp } from '../../../services/sellerService'
import SellerPageHeader from '../../../components/seller/SellerPageHeader'
import Card from '../../../components/Card'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'

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
    } catch {
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
    } catch {
      pushToast('Could not revoke access', { type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Manage Your Apps"
        description="Apps with access to your seller account. Revoke access at any time."
        backTo="/seller/apps-services"
        actions={
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      />

      {/* Info banner */}
      <div className="bg-info-50 border border-info-500/25 rounded-xl p-4 text-sm text-info-700 flex gap-3">
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Tip:</strong> Review your connected apps periodically. Revoke access for anything you don't
          recognize or no longer use.
        </div>
      </div>

      {/* Apps list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No connected apps"
          message="Apps you authorize from the Selling Partner Appstore will appear here."
          action={
            <Link to="/seller/apps-services/appstore">
              <Button variant="secondary">
                <Package className="w-4 h-4" /> Browse the Appstore
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-charcoal-900 flex items-center justify-center text-brass-300 font-semibold flex-shrink-0">
                  {a.app_name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-charcoal-900">{a.app_name}</h3>
                    <Badge color="green">Active</Badge>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    by {a.app_developer || 'Unknown'} · {a.app_category || 'General'}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Connected{' '}
                    {new Date(a.connected_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(a.permissions || []).map((p) => (
                      <span key={p} className="text-xs bg-stone-100 text-charcoal-700 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 inline mr-1 text-success-600" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 flex-shrink-0">
                  <Link to={`/seller/apps-services/app/${a.app_id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" className="flex-1 md:flex-none" onClick={() => setConfirmRevoke(a)}>
                    <Trash2 className="w-3.5 h-3.5" /> Revoke
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Revoke confirmation modal */}
      {confirmRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-900/50" onClick={() => setConfirmRevoke(null)} />
          <div className="relative bg-bone-50 rounded-xl shadow-lifted w-full max-w-md animate-scale-in">
            <div className="border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-error-600" />
                <h2 className="heading-sub">Revoke access?</h2>
              </div>
              <button
                onClick={() => setConfirmRevoke(null)}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-body-sm">
                <strong className="text-charcoal-900 font-medium">{confirmRevoke.app_name}</strong> will lose access
                to your seller account. Any active syncs or integrations will stop.
              </p>
              <p className="text-xs text-charcoal-500">You can reconnect it later from the Appstore.</p>
            </div>

            <div className="border-t border-stone-200 px-5 py-3.5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmRevoke(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleRevoke(confirmRevoke)}>
                Revoke access
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
