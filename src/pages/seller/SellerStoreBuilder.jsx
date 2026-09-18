import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Eye,
  Monitor,
  Smartphone,
  Check,
  Plus,
  X,
  Upload,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerStore,
  upsertSellerStore,
  getSellerProducts,
} from '../../services/sellerService'

const EMPTY = {
  store_name: '',
  tagline: '',
  brand_description: '',
  brand_story: '',
  logo_url: '',
  hero_image_url: '',
  featured_product_ids: [],
  grid_product_ids: [],
  status: 'draft',
}

export default function SellerStoreBuilder() {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState('desktop')

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const [s, p] = await Promise.all([
        getSellerStore(user.id),
        getSellerProducts(user.id),
      ])
      setProducts(p)
      if (s) {
        setForm({
          store_name: s.store_name || '',
          tagline: s.tagline || '',
          brand_description: s.brand_description || '',
          brand_story: s.brand_story || '',
          logo_url: s.logo_url || '',
          hero_image_url: s.hero_image_url || '',
          featured_product_ids: s.featured_product_ids || [],
          grid_product_ids: s.grid_product_ids || [],
          status: s.status || 'draft',
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleFeatured(productId) {
    setForm((f) => ({
      ...f,
      featured_product_ids: f.featured_product_ids.includes(productId)
        ? f.featured_product_ids.filter((id) => id !== productId)
        : [...f.featured_product_ids, productId].slice(0, 4),
    }))
  }

  function toggleGrid(productId) {
    setForm((f) => ({
      ...f,
      grid_product_ids: f.grid_product_ids.includes(productId)
        ? f.grid_product_ids.filter((id) => id !== productId)
        : [...f.grid_product_ids, productId],
    }))
  }

  async function save(nextStatus) {
    if (!form.store_name.trim()) {
      return setError('Store name is required')
    }
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, status: nextStatus || form.status }
      await upsertSellerStore(user.id, payload)
      pushToast(nextStatus === 'published' ? 'Store published' : 'Store saved', {
        type: 'success',
      })
      if (nextStatus === 'published') navigate('/seller/store')
      else load()
    } catch (err) {
      setError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading builder…</div>
  }

  const featuredProducts = form.featured_product_ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/store"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Store builder</h1>
          <p className="text-sm text-gray-600">
            Design your brand storefront. Save as draft or publish live.
          </p>
        </div>
        <span
          className={
            'text-xs font-bold px-3 py-1 rounded-full ' +
            (form.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600')
          }
        >
          {form.status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        {/* Left: form */}
        <div className="space-y-5">
          {/* Identity */}
          <Card title="Store identity">
            <Field label="Store name">
              <input
                type="text"
                value={form.store_name}
                onChange={(e) => update('store_name', e.target.value)}
                placeholder="e.g. Zarsham Store"
                className="input"
              />
            </Field>
            <Field label="Tagline (short slogan)">
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                placeholder="e.g. Premium audio, engineered for life."
                className="input"
              />
            </Field>
            <Field label="Brand description">
              <textarea
                rows={3}
                value={form.brand_description}
                onChange={(e) => update('brand_description', e.target.value)}
                placeholder="Short summary of what your brand sells."
                className="input resize-none"
              />
            </Field>
          </Card>

          {/* Visuals */}
          <Card title="Visuals">
            <Field label="Logo URL">
              <input
                type="url"
                value={form.logo_url}
                onChange={(e) => update('logo_url', e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </Field>
            {form.logo_url && (
              <img
                src={form.logo_url}
                alt=""
                className="w-16 h-16 rounded object-cover border bg-white"
              />
            )}

            <Field label="Hero banner URL">
              <input
                type="url"
                value={form.hero_image_url}
                onChange={(e) => update('hero_image_url', e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </Field>
            {form.hero_image_url && (
              <div className="aspect-[16/6] rounded overflow-hidden border bg-gray-100">
                <img src={form.hero_image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </Card>

          {/* Featured products */}
          <Card title="Featured products (up to 4)">
            <p className="text-xs text-gray-500 mb-3">
              Selected: {featuredProducts.length} / 4
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {products.map((p) => {
                const active = form.featured_product_ids.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleFeatured(p.id)}
                    className={
                      'text-left border rounded overflow-hidden transition ' +
                      (active
                        ? 'border-[#c7511f] ring-2 ring-[#c7511f]/20'
                        : 'border-gray-200 hover:border-gray-400')
                    }
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="aspect-square bg-gray-100" />
                    )}
                    <div className="p-2 text-xs text-gray-700 line-clamp-2">
                      {p.title}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Product grid */}
          <Card title="Product grid (all or pick specific)">
            <p className="text-xs text-gray-500 mb-3">
              {form.grid_product_ids.length === 0
                ? 'All products will show (none manually selected).'
                : `${form.grid_product_ids.length} selected`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {products.map((p) => {
                const active = form.grid_product_ids.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleGrid(p.id)}
                    className={
                      'text-left border rounded overflow-hidden transition ' +
                      (active
                        ? 'border-[#c7511f] ring-2 ring-[#c7511f]/20'
                        : 'border-gray-200 hover:border-gray-400')
                    }
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="aspect-square bg-gray-100" />
                    )}
                    <div className="p-2 text-xs text-gray-700 line-clamp-2">
                      {p.title}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Brand story */}
          <Card title="Brand story">
            <Field label="Your story">
              <textarea
                rows={5}
                value={form.brand_story}
                onChange={(e) => update('brand_story', e.target.value)}
                placeholder="Tell shoppers about your brand — how you started, what makes your products special."
                className="input resize-none"
              />
            </Field>
          </Card>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-20 self-start">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
              <div className="text-xs uppercase tracking-wider text-gray-500">Preview</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setPreview('desktop')}
                  className={
                    'p-1.5 rounded ' +
                    (preview === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200')
                  }
                  aria-label="Desktop preview"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreview('mobile')}
                  className={
                    'p-1.5 rounded ' +
                    (preview === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200')
                  }
                  aria-label="Mobile preview"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={preview === 'mobile' ? 'p-6' : ''}>
              <div
                className={
                  preview === 'mobile'
                    ? 'w-[280px] mx-auto border rounded-lg overflow-hidden bg-white'
                    : ''
                }
              >
                {/* Hero */}
                <div className="relative aspect-[16/8] bg-gradient-to-br from-[#232f3e] to-[#131921]">
                  {form.hero_image_url && (
                    <img
                      src={form.hero_image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    {form.logo_url && (
                      <img
                        src={form.logo_url}
                        alt=""
                        className="w-10 h-10 rounded object-cover border-2 border-white bg-white mb-2"
                      />
                    )}
                    <h3 className="text-white font-bold drop-shadow-md truncate">
                      {form.store_name || 'Your Store'}
                    </h3>
                    {form.tagline && (
                      <p className="text-gray-100 text-xs drop-shadow truncate">
                        {form.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Featured */}
                {featuredProducts.length > 0 && (
                  <div className="p-3">
                    <div className="text-xs font-bold text-gray-900 mb-2">Featured</div>
                    <div className="grid grid-cols-2 gap-2">
                      {featuredProducts.slice(0, 4).map((p) => (
                        <div key={p.id} className="border rounded overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
                          ) : (
                            <div className="aspect-square bg-gray-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid preview */}
                {products.length > 0 && (
                  <div className="p-3 border-t">
                    <div className="text-xs font-bold text-gray-900 mb-2">Products</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {products.slice(0, 6).map((p) => (
                        <div key={p.id} className="aspect-square border rounded overflow-hidden bg-gray-100">
                          {p.image_url && (
                            <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer actions */}
      <div className="sticky bottom-0 bg-white border-t -mx-6 px-6 py-3 flex items-center justify-end gap-3">
        <Link
          to="/seller/store"
          className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={() => save('draft')}
          disabled={saving}
          className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button
          onClick={() => save('published')}
          disabled={saving}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded flex items-center gap-2 disabled:opacity-60 transition"
        >
          <Eye className="w-4 h-4" />
          {saving ? 'Publishing…' : 'Publish store'}
        </button>
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 pb-2 border-b">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      {children}
    </div>
  )
}