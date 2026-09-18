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
    } catch (err) {
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
      pushToast(next === 'published' ? 'Store published' : 'Moved to draft', {
        type: 'success',
      })
      load()
    } catch {
      pushToast('Could not update', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading store…</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Store</h1>
          <p className="text-sm text-gray-600">
            Build a custom storefront for your brand on Amazon Rebuild.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {store && (
            <>
              <Link
                to="/seller/store/builder"
                className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
              >
                <Edit className="w-4 h-4" /> Edit store
              </Link>
              {store.status === 'published' && (
                <Link
                  to={'/store/' + store.slug}
                  target="_blank"
                  className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> View live
                </Link>
              )}
            </>
          )}
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!store ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No store yet
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Create a custom storefront with your logo, hero banner, featured
            products, and brand story.
          </p>
          <Link
            to="/seller/store/builder"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            <Plus className="w-4 h-4" /> Create your store
          </Link>
        </div>
      ) : (
        <>
          {/* Preview card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative aspect-[16/6] bg-gradient-to-br from-[#232f3e] to-[#131921]">
              {store.hero_image_url && (
                <img
                  src={store.hero_image_url}
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
              )}
              <div className="absolute inset-0 flex items-end p-6 md:p-8">
                <div>
                  {store.logo_url && (
                    <img
                      src={store.logo_url}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border-2 border-white mb-3 bg-white"
                    />
                  )}
                  <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-md">
                    {store.store_name}
                  </h2>
                  {store.tagline && (
                    <p className="text-gray-100 text-sm mt-1 drop-shadow">
                      {store.tagline}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <span
                  className={
                    'inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ' +
                    (store.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800')
                  }
                >
                  {store.status === 'published' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" /> Draft
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Stat label="Featured" value={(store.featured_product_ids || []).length} />
                <Stat label="In grid" value={(store.grid_product_ids || []).length} />
                <Stat
                  label="Published"
                  value={
                    store.published_at
                      ? new Date(store.published_at).toLocaleDateString()
                      : '—'
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Link
                  to="/seller/store/builder"
                  className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
                >
                  <Edit className="w-4 h-4" /> Edit store
                </Link>
                {store.status === 'published' && (
                  <Link
                    to={'/store/' + store.slug}
                    target="_blank"
                    className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> View live store
                  </Link>
                )}
                <button
                  onClick={togglePublish}
                  disabled={busy}
                  className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm disabled:opacity-60"
                >
                  {store.status === 'published' ? 'Unpublish' : 'Publish store'}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Public URL:{' '}
                <span className="font-mono">/store/{store.slug}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}