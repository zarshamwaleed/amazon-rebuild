import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gift,
  Plus,
  RefreshCw,
  Calendar,
  MapPin,
  Trash2,
  Edit,
  Eye,
  Share2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getMyRegistries,
  deleteRegistry,
  getRegistryTypeMeta,
  REGISTRY_TYPE_ICONS as TYPE_ICONS,
} from '../services/registryService'
import Button from '../components/Button'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'

const PRIVACY_BADGE = { public: 'blue', shared: 'yellow', private: 'gray' }

export default function ManageRegistries() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [registries, setRegistries] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const r = await getMyRegistries(user.id)
      setRegistries(r)
    } catch {
      pushToast('Could not load registries', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  async function handleDelete(r) {
    try {
      await deleteRegistry(r.id)
      pushToast('Registry deleted', { type: 'info' })
      setConfirmDelete(null)
      load()
    } catch {
      pushToast('Could not delete', { type: 'error' })
    }
  }

  function handleCopyLink(r) {
    const url = `${window.location.origin}/registry/${r.id}`
    navigator.clipboard?.writeText(url).then(
      () => pushToast('Registry link copied', { type: 'success' }),
      () => pushToast('Could not copy link', { type: 'error' })
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">Your Registries</h1>
          <p className="text-body-sm mt-1.5">Manage everything you've created.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/registry/create">
            <Button variant="secondary">
              <Plus className="w-4 h-4" /> Create Registry
            </Button>
          </Link>
          <Button variant="outline" onClick={load} aria-label="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : registries.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="You don't have any registries yet"
          message="Create your first registry to start saving products for a special occasion."
          action={
            <Link to="/registry/create">
              <Button>
                <Plus className="w-4 h-4" /> Create Registry
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {registries.map((r) => {
            const meta = getRegistryTypeMeta(r.type)
            const Icon = TYPE_ICONS[r.type] || Gift
            const date = r.expected_date || r.event_date
            return (
              <div
                key={r.id}
                className="bg-bone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-subtle transition-avenzo hover:shadow-soft hover:border-stone-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brass-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brass-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="heading-sub truncate">{r.name}</h3>
                    <Badge color={PRIVACY_BADGE[r.privacy] || 'gray'} className="capitalize">
                      {r.privacy}
                    </Badge>
                  </div>
                  <div className="text-caption flex flex-wrap items-center gap-3">
                    <span className="capitalize">{meta.name}</span>
                    {date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(date).toLocaleDateString()}
                      </span>
                    )}
                    {r.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <Link to={`/registry/${r.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </Link>
                  <Link to={`/registry/${r.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(r)}>
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </Button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(r)}
                    aria-label="Delete registry"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-stone-300 text-charcoal-500 hover:text-error-700 hover:border-error-500/30 hover:bg-error-50 transition-avenzo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-900/50 animate-fade-in"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md p-6 animate-scale-in">
            <h2 className="heading-sub mb-2">Delete registry?</h2>
            <p className="text-body-sm mb-5">
              <strong className="text-charcoal-900">{confirmDelete.name}</strong> will be
              removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(confirmDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
