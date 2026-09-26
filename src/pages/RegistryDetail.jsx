import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Gift,
  Calendar,
  MapPin,
  Share2,
  Edit,
  Plus,
  Trash2,
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
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Input from '../components/Input'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import Rating from '../components/Rating'
import {
  getRegistryById,
  getRegistryItems,
  computeRegistryProgress,
  removeRegistryItem,
  updateRegistryItem,
  getRegistryTypeMeta,
  REGISTRY_TYPE_ICONS,
} from '../services/registryService'

const PRIORITY_META = {
  must_have: { label: 'Must Have', color: 'red' },
  high: { label: 'High', color: 'yellow' },
  normal: { label: 'Normal', color: 'gray' },
  low: { label: 'Low', color: 'blue' },
}

const textareaClass =
  'w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 ' +
  'placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 resize-none'

export default function RegistryDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const { addItem } = useCart()

  const [registry, setRegistry] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

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
    } catch {
      pushToast('Could not load registry', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleRemoveItem(item) {
    try {
      await removeRegistryItem(item.id)
      pushToast('Item removed', { type: 'info' })
      setConfirmRemove(null)
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
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="skeleton-shimmer h-5 w-24 rounded" />
        <div className="skeleton-shimmer h-56 md:h-64 rounded-2xl" />
        <div className="skeleton-shimmer h-32 rounded-xl" />
        <LoadingSkeleton count={6} />
      </div>
    )
  }

  if (!registry) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <EmptyState
          icon={Gift}
          title="Registry not found"
          message="This registry doesn't exist or is private."
          action={
            <Link to="/registry">
              <Button>Browse Registries</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const meta = getRegistryTypeMeta(registry.type)
  const progress = computeRegistryProgress(items)
  const date = registry.expected_date || registry.event_date

  return (
    <div className="space-y-8">
      <Link
        to={isOwner ? '/registry/manage' : '/registry'}
        className="text-body-sm text-charcoal-600 hover:text-charcoal-900 inline-flex items-center gap-1.5 transition-avenzo"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Hero */}
      <div
        className={
          'relative rounded-2xl overflow-hidden shadow-card bg-gradient-to-br ' + meta.color
        }
      >
        <div className="absolute inset-0 bg-charcoal-900/25" />
        <div className="relative p-8 md:p-12">
          {(() => {
            const TypeIcon = REGISTRY_TYPE_ICONS[registry.type] || Gift
            return (
              <span className="inline-flex w-12 h-12 rounded-xl bg-white/15 items-center justify-center mb-3">
                <TypeIcon className="w-6 h-6 text-white" />
              </span>
            )
          })()}
          <div className="text-xs uppercase tracking-[0.15em] font-medium text-white/80 mb-2">
            {meta.name}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-medium text-white leading-tight">
            {registry.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-sm text-white/90">
            {date && (
              <span className="flex items-center gap-1.5">
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
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {registry.city}
                {registry.state ? ', ' + registry.state : ''}
              </span>
            )}
            {!isOwner && (
              <span className="flex items-center gap-1.5">
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

          {registry.description && (
            <p className="text-white/90 mt-4 max-w-2xl leading-relaxed">
              {registry.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" onClick={() => setShowShare(true)}>
          <Share2 className="w-4 h-4" /> Share
        </Button>
        {isOwner && (
          <>
            <Link to={`/registry/${registry.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="secondary">
                <Plus className="w-4 h-4" /> Add Items
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <Card title="Registry Progress">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <div className="text-3xl font-display font-medium text-charcoal-900">
                {progress.requested}
              </div>
              <div className="text-label mt-1">Items</div>
            </div>
            <div>
              <div className="text-3xl font-display font-medium text-success-700">
                {progress.purchased}
              </div>
              <div className="text-label mt-1">Purchased</div>
            </div>
            <div>
              <div className="text-3xl font-display font-medium text-brass-700">
                {progress.remaining}
              </div>
              <div className="text-label mt-1">Remaining</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-body-sm mb-1.5">
              <span>{progress.purchased} of {progress.requested} purchased</span>
              <span className="font-medium text-charcoal-900">
                {progress.percent.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brass-300 to-brass-500 rounded-full transition-avenzo duration-slow"
                style={{ width: progress.percent + '%' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Items */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="heading-section">
            Registry Items ({items.length})
          </h2>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={isOwner ? 'Your registry is empty' : 'No items yet'}
            message="Start adding products that you'd like friends and family to purchase."
            action={
              isOwner && (
                <Link to="/products">
                  <Button>
                    <Plus className="w-4 h-4" /> Browse Products
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <RegistryItemCard
                key={item.id}
                item={item}
                isOwner={isOwner}
                onRemove={() => setConfirmRemove(item)}
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

      {/* Confirm remove-item modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-900/50 animate-fade-in"
            onClick={() => setConfirmRemove(null)}
          />
          <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md p-6 animate-scale-in">
            <h2 className="heading-sub mb-2">Remove item?</h2>
            <p className="text-body-sm mb-5">
              <strong className="text-charcoal-900">{confirmRemove.product?.title}</strong> will
              be removed from this registry.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmRemove(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleRemoveItem(confirmRemove)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
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
    <div className="group bg-bone-50 border border-stone-200 rounded-xl shadow-subtle hover:shadow-soft transition-avenzo overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`} className="block aspect-square bg-stone-50 overflow-hidden">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-avenzo duration-slow"
            loading="lazy"
          />
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center flex-wrap gap-1.5 mb-2">
          <Badge color={priority.color}>{priority.label}</Badge>
          {purchased && <Badge color="green">Purchased</Badge>}
          {partial && <Badge color="yellow">Partial</Badge>}
        </div>

        <Link
          to={`/products/${product.id}`}
          className="text-body-sm font-medium text-charcoal-900 hover:text-brass-700 line-clamp-2 mb-1.5 transition-avenzo"
        >
          {product.title}
        </Link>

        {product.rating > 0 && (
          <Rating value={product.rating} count={product.review_count} size="sm" className="mb-2" />
        )}

        <div className="text-price mb-3">${Number(product.price).toFixed(2)}</div>

        <dl className="text-caption space-y-1 mb-3">
          <div className="flex justify-between">
            <dt>Requested</dt>
            <dd className="text-charcoal-900">{item.quantity_requested}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Purchased</dt>
            <dd className={item.quantity_purchased > 0 ? 'text-success-700 font-medium' : 'text-charcoal-900'}>
              {item.quantity_purchased}
            </dd>
          </div>
          {remaining > 0 && (
            <div className="flex justify-between">
              <dt>Remaining</dt>
              <dd className="text-brass-700 font-medium">{remaining}</dd>
            </div>
          )}
        </dl>

        {item.public_note && (
          <p className="text-caption italic bg-stone-50 border border-stone-200 rounded-lg p-2.5 mb-3">
            "{item.public_note}"
          </p>
        )}

        <div className="mt-auto space-y-2 pt-1">
          {!purchased && (
            <Button variant="secondary" className="w-full" onClick={onBuyForRegistry}>
              <ShoppingCart className="w-3.5 h-3.5" />
              Buy for Registry
            </Button>
          )}
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={onRemove}>
                <Trash2 className="w-3 h-3" /> Remove
              </Button>
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
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md animate-scale-in">
        <div className="border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub">Share your registry</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-label block mb-1.5">Registry link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/registry/${registry.id}`}
                className="flex-1 border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm bg-stone-50 text-charcoal-700"
              />
              <Button variant="secondary" onClick={onCopy}>
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>
          </div>

          <div className="text-caption bg-stone-50 border border-stone-200 rounded-lg p-3">
            Registry visibility: <strong className="capitalize text-charcoal-700">{registry.privacy}</strong>.
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
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub truncate pr-3">
            Edit {item.product?.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <Input
            label="Quantity requested"
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />

          <div>
            <label className="text-label block mb-2">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRIORITY_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={
                    'py-2 rounded-lg border text-sm transition-avenzo ' +
                    (priority === key
                      ? 'border-brass-500 bg-brass-50 font-medium text-charcoal-900'
                      : 'border-stone-300 text-charcoal-700 hover:border-stone-400')
                  }
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-label block mb-1.5">
              Public note (visible to guests)
            </label>
            <textarea
              rows={2}
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              placeholder="e.g. We prefer the gray version."
              className={textareaClass}
            />
          </div>

          <div>
            <label className="text-label block mb-1.5">
              Private note (only you)
            </label>
            <textarea
              rows={2}
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              placeholder="e.g. Sarah's mom already offered to buy this."
              className={textareaClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" loading={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
