import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  Monitor,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerStore,
  upsertSellerStore,
  getSellerProducts,
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Input from '../../components/Input'

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
      const [s, p] = await Promise.all([getSellerStore(user.id), getSellerProducts(user.id)])
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
      pushToast(nextStatus === 'published' ? 'Store published' : 'Store saved', { type: 'success' })
      if (nextStatus === 'published') navigate('/seller/store')
      else load()
    } catch (err) {
      setError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 rounded-lg skeleton-shimmer" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          <div className="h-96 rounded-xl skeleton-shimmer" />
          <div className="h-96 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  const featuredProducts = form.featured_product_ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-6 pb-20">
      <SellerPageHeader
        title="Store builder"
        description="Design your brand storefront. Save as draft or publish live."
        backTo="/seller/store"
        actions={<Badge color={form.status === 'published' ? 'green' : 'gray'}>{form.status === 'published' ? 'Published' : 'Draft'}</Badge>}
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        {/* Left: form */}
        <div className="space-y-5">
          <Card title="Store identity">
            <div className="space-y-4">
              <Input
                label="Store name"
                type="text"
                value={form.store_name}
                onChange={(e) => update('store_name', e.target.value)}
                placeholder="e.g. Zarsham Store"
              />
              <Input
                label="Tagline (short slogan)"
                type="text"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                placeholder="e.g. Premium audio, engineered for life."
              />
              <TextField
                label="Brand description"
                rows={3}
                value={form.brand_description}
                onChange={(e) => update('brand_description', e.target.value)}
                placeholder="Short summary of what your brand sells."
              />
            </div>
          </Card>

          <Card title="Visuals">
            <div className="space-y-4">
              <Input
                label="Logo URL"
                type="url"
                value={form.logo_url}
                onChange={(e) => update('logo_url', e.target.value)}
                placeholder="https://..."
              />
              {form.logo_url && (
                <img src={form.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-stone-200 bg-bone-50" />
              )}

              <Input
                label="Hero banner URL"
                type="url"
                value={form.hero_image_url}
                onChange={(e) => update('hero_image_url', e.target.value)}
                placeholder="https://..."
              />
              {form.hero_image_url && (
                <div className="aspect-[16/6] rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={form.hero_image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </Card>

          <Card title="Featured products" subtitle="Up to 4 products highlighted at the top of your store">
            <p className="text-caption mb-3">Selected: {featuredProducts.length} / 4</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {products.map((p) => {
                const active = form.featured_product_ids.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleFeatured(p.id)}
                    className={
                      'text-left border rounded-lg overflow-hidden transition-avenzo ' +
                      (active ? 'border-brass-500 ring-2 ring-brass-400/30' : 'border-stone-200 hover:border-stone-400')
                    }
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="aspect-square bg-stone-100" />
                    )}
                    <div className="p-2 text-xs text-charcoal-700 line-clamp-2">{p.title}</div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card title="Product grid" subtitle="All products show by default, or pick specific ones">
            <p className="text-caption mb-3">
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
                      'text-left border rounded-lg overflow-hidden transition-avenzo ' +
                      (active ? 'border-brass-500 ring-2 ring-brass-400/30' : 'border-stone-200 hover:border-stone-400')
                    }
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="aspect-square bg-stone-100" />
                    )}
                    <div className="p-2 text-xs text-charcoal-700 line-clamp-2">{p.title}</div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card title="Brand story">
            <TextField
              label="Your story"
              rows={5}
              value={form.brand_story}
              onChange={(e) => update('brand_story', e.target.value)}
              placeholder="Tell shoppers about your brand — how you started, what makes your products special."
            />
          </Card>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/25 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-20 self-start">
          <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-stone-50">
              <div className="text-label">Preview</div>
              <div className="flex gap-1 bg-bone-50 rounded-lg p-0.5 border border-stone-200">
                <button
                  onClick={() => setPreview('desktop')}
                  className={
                    'p-1.5 rounded-md transition-avenzo ' +
                    (preview === 'desktop' ? 'bg-charcoal-900 text-bone-50' : 'text-charcoal-500 hover:bg-stone-100')
                  }
                  aria-label="Desktop preview"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreview('mobile')}
                  className={
                    'p-1.5 rounded-md transition-avenzo ' +
                    (preview === 'mobile' ? 'bg-charcoal-900 text-bone-50' : 'text-charcoal-500 hover:bg-stone-100')
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
                    ? 'w-[280px] mx-auto border border-stone-200 rounded-lg overflow-hidden bg-bone-50'
                    : ''
                }
              >
                {/* Hero */}
                <div className="relative aspect-[16/8] bg-gradient-to-br from-charcoal-800 to-charcoal-900">
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
                        className="w-10 h-10 rounded object-cover border-2 border-bone-50 bg-bone-50 mb-2"
                      />
                    )}
                    <h3 className="font-display text-bone-50 drop-shadow-md truncate">
                      {form.store_name || 'Your Store'}
                    </h3>
                    {form.tagline && <p className="text-stone-200 text-xs drop-shadow truncate">{form.tagline}</p>}
                  </div>
                </div>

                {/* Featured */}
                {featuredProducts.length > 0 && (
                  <div className="p-3">
                    <div className="text-xs font-semibold text-charcoal-900 mb-2">Featured</div>
                    <div className="grid grid-cols-2 gap-2">
                      {featuredProducts.slice(0, 4).map((p) => (
                        <div key={p.id} className="border border-stone-200 rounded overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
                          ) : (
                            <div className="aspect-square bg-stone-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid preview */}
                {products.length > 0 && (
                  <div className="p-3 border-t border-stone-200">
                    <div className="text-xs font-semibold text-charcoal-900 mb-2">Products</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {products.slice(0, 6).map((p) => (
                        <div key={p.id} className="aspect-square border border-stone-200 rounded overflow-hidden bg-stone-100">
                          {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
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
      <div className="sticky bottom-0 bg-bone-50 border-t border-stone-200 -mx-6 px-6 py-3 flex items-center justify-end gap-3">
        <Link to="/seller/store">
          <Button variant="outline" size="md">
            Cancel
          </Button>
        </Link>
        <Button variant="outline" size="md" onClick={() => save('draft')} loading={saving}>
          Save draft
        </Button>
        <Button variant="secondary" size="md" onClick={() => save('published')} loading={saving}>
          <Eye className="w-4 h-4" /> Publish store
        </Button>
      </div>
    </div>
  )
}

function TextField({ label, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-label mb-1.5">{label}</label>
      <textarea
        className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 resize-none"
        {...props}
      />
    </div>
  )
}
