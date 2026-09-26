import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  Plus,
  ExternalLink,
  Edit,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerStore, upsertSellerStore } from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

export default function SellerStore() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const s = await getSellerStore(user.id)
      setStore(s)
    } catch {
      pushToast('Could not load store', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  async function togglePublish() {
    if (!store) return
    const next = store.status === 'published' ? 'draft' : 'published'
    setBusy(true)
    try {
      await upsertSellerStore(user.id, { ...store, status: next })
      pushToast(next === 'published' ? 'Store published' : 'Moved to draft', { type: 'success' })
      load()
    } catch {
      pushToast('Could not update', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 rounded-lg skeleton-shimmer" />
        <div className="h-80 rounded-xl skeleton-shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Brand Store"
        description="Build a custom storefront for your brand on Avenzo."
        actions={
          <>
            {store && (
              <>
                <Link to="/seller/store/builder">
                  <Button variant="secondary" size="md">
                    <Edit className="w-4 h-4" /> Edit store
                  </Button>
                </Link>
                {store.status === 'published' && (
                  <Link to={'/store/' + store.slug} target="_blank">
                    <Button variant="outline" size="md">
                      <ExternalLink className="w-4 h-4" /> View live
                    </Button>
                  </Link>
                )}
              </>
            )}
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {!store ? (
        <EmptyState
          icon={Store}
          title="No store yet"
          message="Create a custom storefront with your logo, hero banner, featured products, and brand story."
          action={
            <Link to="/seller/store/builder">
              <Button variant="secondary" size="lg">
                <Plus className="w-4 h-4" /> Create your store
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
          <div className="relative aspect-[16/6] bg-gradient-to-br from-charcoal-800 to-charcoal-900">
            {store.hero_image_url && (
              <img src={store.hero_image_url} alt="" className="w-full h-full object-cover opacity-70" />
            )}
            <div className="absolute inset-0 flex items-end p-6 md:p-8">
              <div>
                {store.logo_url && (
                  <img
                    src={store.logo_url}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border-2 border-bone-50 mb-3 bg-bone-50"
                  />
                )}
                <h2 className="font-display text-2xl md:text-3xl text-bone-50 drop-shadow-md">
                  {store.store_name}
                </h2>
                {store.tagline && <p className="text-stone-200 text-sm mt-1 drop-shadow">{store.tagline}</p>}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Badge color={store.status === 'published' ? 'green' : 'yellow'}>
                {store.status === 'published' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Published
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Draft
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat label="Featured" value={(store.featured_product_ids || []).length} />
              <Stat label="In grid" value={(store.grid_product_ids || []).length} />
              <Stat
                label="Published"
                value={store.published_at ? new Date(store.published_at).toLocaleDateString() : '—'}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-5 border-t border-stone-200">
              <Link to="/seller/store/builder">
                <Button variant="secondary" size="md">
                  <Edit className="w-4 h-4" /> Edit store
                </Button>
              </Link>
              {store.status === 'published' && (
                <Link to={'/store/' + store.slug} target="_blank">
                  <Button variant="outline" size="md">
                    <ExternalLink className="w-4 h-4" /> View live store
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="md" onClick={togglePublish} loading={busy}>
                {store.status === 'published' ? 'Unpublish' : 'Publish store'}
              </Button>
            </div>

            <p className="text-caption">
              Public URL: <span className="font-mono">/store/{store.slug}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="border border-stone-200 rounded-lg p-3">
      <div className="text-label mb-1">{label}</div>
      <div className="font-display text-lg text-charcoal-900">{value}</div>
    </div>
  )
}
