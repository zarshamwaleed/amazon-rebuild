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
} from '../services/registryService'

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
    <div className="space-y-5 max-w-5xl mx-auto py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Registries</h1>
          <p className="text-sm text-gray-600">
            Manage everything you've created.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/registry/create"
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" /> Create Registry
          </Link>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading…
        </div>
      ) : registries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            You don't have any registries yet
          </h3>
          <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
            Create your first registry to start saving products for a special
            occasion.
          </p>
          <Link
            to="/registry/create"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            <Plus className="w-4 h-4" /> Create Registry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registries.map((r) => {
            const meta = getRegistryTypeMeta(r.type)
            const date = r.expected_date || r.event_date
            return (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div
                  className={
                    'w-14 h-14 rounded-lg bg-gradient-to-br ' +
                    meta.color +
                    ' flex items-center justify-center text-3xl flex-shrink-0'
                  }
                >
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{r.name}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {r.privacy}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                    <span className="capitalize">{meta.name}</span>
                    {date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{' '}
                        {new Date(date).toLocaleDateString()}
                      </span>
                    )}
                    {r.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    to={`/registry/${r.id}`}
                    className="text-sm px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                  <Link
                    to={`/registry/${r.id}/edit`}
                    className="text-sm px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded flex items-center gap-1.5"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Link>
                  <button
                    onClick={() => handleCopyLink(r)}
                    className="text-sm px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    onClick={() => setConfirmDelete(r)}
                    className="text-sm px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
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
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 mb-2">Delete registry?</h2>
            <p className="text-sm text-gray-600 mb-5">
              <strong>{confirmDelete.name}</strong> will be removed. This cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-600 hover:bg-red-500 text-white font-medium px-5 py-2 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}