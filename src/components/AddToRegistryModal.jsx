import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, X, Check, Plus, Minus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getMyRegistries,
  addRegistryItem,
  REGISTRY_TYPES,
} from '../services/registryService'

export default function AddToRegistryModal({ product, onClose, onAdded }) {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [registries, setRegistries] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getMyRegistries(user.id)
      .then((r) => {
        setRegistries(r)
        if (r.length > 0) setSelectedId(r[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  async function handleSubmit() {
    if (!selectedId) return setError('Please select a registry.')
    if (!user) return setError('Please sign in first.')
    setSaving(true)
    setError(null)
    try {
      await addRegistryItem({
        registryId: selectedId,
        productId: product.id,
        quantity,
      })
      pushToast('Added to your registry', { type: 'success' })
      onAdded?.()
    } catch (err) {
      setError(err.message || 'Could not add to registry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#c7511f]" />
            <h2 className="font-bold text-gray-900">Add to Registry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Product preview */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded p-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-12 h-12 rounded object-cover border"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {product.title}
              </div>
              <div className="text-xs text-gray-500">
                ${Number(product.price).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Not signed in */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
              Please{' '}
              <Link to="/login" className="font-medium underline">
                sign in
              </Link>{' '}
              to add items to a registry.
            </div>
          )}

          {/* No registries */}
          {user && !loading && registries.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
              You don't have any registries yet.{' '}
              <Link to="/registry/create" className="font-medium underline">
                Create one →
              </Link>
            </div>
          )}

          {/* Registry picker */}
          {user && registries.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Select a registry
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {registries.map((r) => {
                  const meta = REGISTRY_TYPES.find((t) => t.id === r.type)
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={
                        'w-full flex items-center gap-3 p-3 rounded border text-left transition ' +
                        (selectedId === r.id
                          ? 'border-[#c7511f] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-400')
                      }
                    >
                      <span className="text-2xl">{meta?.emoji || '🎁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {r.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {meta?.name}
                        </div>
                      </div>
                      {selectedId === r.id && (
                        <Check className="w-4 h-4 text-[#c7511f] flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          {user && registries.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Quantity
              </label>
              <div className="inline-flex items-center border border-gray-300 rounded">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 hover:bg-gray-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

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
              type="button"
              onClick={handleSubmit}
              disabled={!selectedId || saving || registries.length === 0}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add to Registry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}