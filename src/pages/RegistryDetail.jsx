import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Gift,
  Calendar,
  MapPin,
  Share2,
  Edit,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  Package,
  Lock,
  Shield,
  Copy,
  X,
  ShoppingCart,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCart } from '../context/CartContext'
import {
  getRegistryById,
  getRegistryItems,
  computeRegistryProgress,
  removeRegistryItem,
  updateRegistryItem,
  getRegistryTypeMeta,
} from '../services/registryService'

const PRIORITY_META = {
  must_have: { label: 'Must Have', cls: 'bg-red-100 text-red-800' },
  high: { label: 'High', cls: 'bg-orange-100 text-orange-800' },
  normal: { label: 'Normal', cls: 'bg-gray-100 text-gray-700' },
  low: { label: 'Low', cls: 'bg-blue-100 text-blue-800' },
}

export default function RegistryDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const { addItem } = useCart()
  const navigate = useNavigate()

  const [registry, setRegistry] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const isOwner = user && registry && user.id === registry.user_id

  async function load() {
    if (!id) return
    try {
      setLoading(true)
      const [reg, it] = await Promise.all([
        getRegistryById(id),
        getRegistryItems(id),
      ])
      setRegistry(reg)
      setItems(it)
    } catch (err) {
      pushToast('Could not load registry', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleRemoveItem(item) {
    if (!confirm(`Remove "${item.product?.title}" from this registry?`)) return
    try {
      await removeRegistryItem(item.id)
      pushToast('Item removed', { type: 'info' })
      load()
    } catch {
      pushToast('Could not remove item', { type: 'error' })
    }
  }

  async function handleUpdateItem(itemId, updates) {
    try {
      await updateRegistryItem(itemId, updates)
      pushToast('Item updated', { type: 'success' })
      setEditingItem(null)
      load()
    } catch {
      pushToast('Could not update', { type: 'error' })
    }
  }

  function handleBuyForRegistry(item) {
    if (!item.product) return
    const qty = Math.max(
      1,
      item.quantity_requested - item.quantity_purchased
    )
    addItem(item.product, qty, {
      registryId: registry.id,
      registryItemId: item.id,
    })
    pushToast(`Added ${qty} to cart · for ${registry.name}`, { type: 'success' })
  }

  function copyLink() {
    const url = `${window.location.origin}/registry/${id}`
    navigator.clipboard?.writeText(url).then(
      () => pushToast('Registry link copied', { type: 'success' }),
      () => pushToast('Could not copy', { type: 'error' })
    )
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-600">Loading registry…</div>
  }

  if (!registry) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Registry not found
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            This registry doesn't exist or is private.
          </p>
          <Link
            to="/registry"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            Browse Registries
          </Link>
        </div>
      </div>
    )
  }

  const meta = getRegistryTypeMeta(registry.type)
  const progress = computeRegistryProgress(items)
  const date = registry.expected_date || registry.event_date

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      <Link
        to={isOwner ? '/registry/manage' : '/registry'}
        className="text-sm text-[#007185] hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Hero */}
      <div className={'rounded-lg overflow-hidden bg-gradient-to-br ' + meta.color + ' text-white'}>
        <div className="p-8 md:p-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-4xl mb-2">{meta.emoji}</div>
              <div className="text-xs uppercase tracking-wider text-white/80 mb-1">
                {meta.name}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold">{registry.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/90">
                {date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {registry.expected_date ? 'Expected' : 'Event'}:{' '}
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {registry.show_location && registry.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {registry.city}
                    {registry.state ? ', ' + registry.state : ''}
                  </span>
                )}
                {!isOwner && (
                  <span className="flex items-center gap-1">
                    {registry.privacy === 'private' ? (
                      <>
                        <Lock className="w-4 h-4" /> Private
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" /> {registry.privacy}
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Owner actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              {isOwner && (
                <>
                  <Link
                    to={`/registry/${registry.id}/edit`}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Link>
                  <Link
                    to="/products"
                    className="bg-white text-gray-900 font-semibold px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" /> Add Items
                  </Link>
                </>
              )}
            </div>
          </div>

          {registry.description && (
            <p className="text-white/90 mt-4 max-w-2xl">{registry.description}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-gray-900 mb-4">Registry Progress</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {progress.requested}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
                Items
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-700">
                {progress.purchased}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
                Purchased
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-700">
                {progress.remaining}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
                Remaining
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {progress.purchased} of {progress.requested} purchased
              </span>
              <span className="font-medium text-gray-900">
                {progress.percent.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#febd69] to-[#f3a847] transition-all"
                style={{ width: progress.percent + '%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Registry Items ({items.length})
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              Your registry is empty
            </h3>
            <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
              Start adding products that you'd like friends and family to
              purchase.
            </p>
            {isOwner && (
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
              >
                <Plus className="w-4 h-4" /> Browse Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <RegistryItemCard
                key={item.id}
                item={item}
                isOwner={isOwner}
                onRemove={() => handleRemoveItem(item)}
                onEdit={() => setEditingItem(item)}
                onBuyForRegistry={() => handleBuyForRegistry(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal
          registry={registry}
          onClose={() => setShowShare(false)}
          onCopy={copyLink}
        />
      )}

      {/* Edit item modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updates) => handleUpdateItem(editingItem.id, updates)}
        />
      )}
    </div>
  )
}

function RegistryItemCard({ item, isOwner, onRemove, onEdit, onBuyForRegistry }) {
  const product = item.product
  if (!product) return null

  const remaining = Math.max(
    0,
    item.quantity_requested - item.quantity_purchased
  )
  const purchased = item.quantity_purchased >= item.quantity_requested
  const partial = item.quantity_purchased > 0 && !purchased
  const priority = PRIORITY_META[item.priority] || PRIORITY_META.normal

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`} className="block aspect-square bg-gray-50 overflow-hidden">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition"
            loading="lazy"
          />
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ' + priority.cls}
          >
            {priority.label}
          </span>
          {purchased && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              Purchased
            </span>
          )}
          {partial && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Partial
            </span>
          )}
        </div>

        <Link
          to={`/products/${product.id}`}
          className="text-sm font-medium text-gray-900 hover:text-[#c7511f] line-clamp-2 mb-1"
        >
          {product.title}
        </Link>

        <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-600">
          {product.rating > 0 && (
            <>
              <Star className="w-3 h-3 fill-[#ffa41c] text-[#ffa41c]" />
              <span className="font-medium text-gray-900">
                {Number(product.rating).toFixed(1)}
              </span>
            </>
          )}
          {product.review_count > 0 && (
            <span className="text-gray-500">
              ({product.review_count.toLocaleString()})
            </span>
          )}
        </div>

        <div className="text-lg font-bold text-gray-900 mb-2">
          ${Number(product.price).toFixed(2)}
        </div>

        <dl className="text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <dt className="text-gray-500">Requested</dt>
            <dd className="text-gray-900">{item.quantity_requested}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Purchased</dt>
            <dd className={item.quantity_purchased > 0 ? 'text-green-700 font-medium' : 'text-gray-900'}>
              {item.quantity_purchased}
            </dd>
          </div>
          {remaining > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Remaining</dt>
              <dd className="text-amber-700 font-medium">{remaining}</dd>
            </div>
          )}
        </dl>

        {item.public_note && (
          <p className="text-xs text-gray-600 italic bg-gray-50 border border-gray-200 rounded p-2 mb-3">
            "{item.public_note}"
          </p>
        )}

        <div className="mt-auto space-y-2">
          {!purchased && (
            <button
              onClick={onBuyForRegistry}
              className="w-full text-center text-sm font-medium bg-[#febd69] hover:bg-[#f3a847] text-gray-900 py-2 rounded flex items-center justify-center gap-1.5 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Buy for Registry
            </button>
          )}
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 text-xs border border-gray-300 hover:bg-gray-50 py-1.5 rounded"
              >
                Edit
              </button>
              <button
                onClick={onRemove}
                className="text-xs border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShareModal({ registry, onClose, onCopy }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Share your registry</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Registry link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/registry/${registry.id}`}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
              />
              <button
                onClick={onCopy}
                className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded text-sm flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
            Registry visibility: <strong className="capitalize">{registry.privacy}</strong>.
            {registry.privacy === 'public'
              ? ' Anyone can find and view this registry.'
              : registry.privacy === 'shared'
              ? ' Only people with this link can view it.'
              : ' Only you can view it.'}
          </div>
        </div>
      </div>
    </div>
  )
}

function EditItemModal({ item, onClose, onSave }) {
  const [qty, setQty] = useState(item.quantity_requested)
  const [priority, setPriority] = useState(item.priority || 'normal')
  const [publicNote, setPublicNote] = useState(item.public_note || '')
  const [privateNote, setPrivateNote] = useState(item.private_note || '')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        quantity_requested: Number(qty) || 1,
        priority,
        public_note: publicNote.trim() || null,
        private_note: privateNote.trim() || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            Edit {item.product?.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Quantity requested
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRIORITY_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={
                    'py-2 rounded border text-sm ' +
                    (priority === key
                      ? 'border-[#c7511f] bg-orange-50 font-medium'
                      : 'border-gray-300 hover:border-gray-400')
                  }
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Public note (visible to guests)
            </label>
            <textarea
              rows={2}
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              placeholder="e.g. We prefer the gray version."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Private note (only you)
            </label>
            <textarea
              rows={2}
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              placeholder="e.g. Sarah's mom already offered to buy this."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
            />
          </div>

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
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}