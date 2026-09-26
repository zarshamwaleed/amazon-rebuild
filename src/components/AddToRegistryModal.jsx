import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from './Button'
import QuantitySelector from './QuantitySelector'
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
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md animate-scale-in">
        <div className="border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-brass-600" />
            <h2 className="heading-sub">Add to Registry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Product preview */}
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-stone-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-av-body-sm font-medium text-charcoal-900 truncate">
                {product.title}
              </div>
              <div className="text-av-caption text-charcoal-500">
                ${Number(product.price).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Not signed in */}
          {!user && (
            <div className="bg-info-50 border border-info-500/20 rounded-xl p-3 text-av-body-sm text-info-700">
              Please{' '}
              <Link to="/login" className="font-medium underline">
                sign in
              </Link>{' '}
              to add items to a registry.
            </div>
          )}

          {/* No registries */}
          {user && !loading && registries.length === 0 && (
            <div className="bg-warning-50 border border-warning-500/20 rounded-xl p-3 text-av-body-sm text-warning-700">
              You don't have any registries yet.{' '}
              <Link to="/registry/create" className="font-medium underline">
                Create one →
              </Link>
            </div>
          )}

          {/* Registry picker */}
          {user && registries.length > 0 && (
            <div>
              <label className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-2">
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
                        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-avenzo ' +
                        (selectedId === r.id
                          ? 'border-brass-400 bg-brass-50'
                          : 'border-stone-200 hover:border-stone-400')
                      }
                    >
                      <span className="text-2xl">{meta?.emoji || '🎁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-av-body-sm font-medium text-charcoal-900 truncate">
                          {r.name}
                        </div>
                        <div className="text-av-caption text-charcoal-500 capitalize">
                          {meta?.name}
                        </div>
                      </div>
                      {selectedId === r.id && (
                        <Check className="w-4 h-4 text-brass-600 flex-shrink-0" />
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
              <label className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-1.5">
                Quantity
              </label>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>
          )}

          {error && (
            <div className="text-av-body-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit}
              disabled={!selectedId || registries.length === 0}
              loading={saving}
            >
              Add to Registry
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
