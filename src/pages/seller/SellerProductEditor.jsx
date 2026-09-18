import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  X,
  Save,
  Eye,
  Upload,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getAllCategories } from '../../services/categoryService'
import {
  createSellerProduct,
  getSellerProduct,
  updateSellerProduct,
  publishProduct,
} from '../../services/sellerService'

const EMPTY = {
  title: '',
  brand: '',
  manufacturer: '',
  category_id: '',
  product_type: '',
  description: '',
  bullet_points: ['', '', '', '', ''],
  keywords: '',
  image_url: '',
  additional_images: [],
  variations: [],
  price: '',
  old_price: '',
  msrp: '',
  sku: '',
  stock: '',
  low_stock_threshold: 5,
  fulfillment_method: 'FBM',
}

export default function SellerProductEditor() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [openSections, setOpenSections] = useState({
    basic: true,
    details: true,
    images: true,
    variations: false,
    pricing: true,
    inventory: true,
    fulfillment: true,
  })

  function toggleSection(key) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }))
  }

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit || !user) return
    let cancelled = false
    getSellerProduct(user.id, id)
      .then((p) => {
        if (cancelled) return
        if (!p) {
          setError('Product not found or does not belong to you.')
          return
        }
        setForm({
          title: p.title || '',
          brand: p.brand || '',
          manufacturer: p.manufacturer || '',
          category_id: p.category_id || '',
          product_type: p.product_type || '',
          description: p.description || '',
          bullet_points:
            p.bullet_points && p.bullet_points.length
              ? [...p.bullet_points, '', '', '', '', ''].slice(0, 5)
              : ['', '', '', '', ''],
          keywords: p.keywords || '',
          image_url: p.image_url || '',
          additional_images: p.additional_images || [],
          variations: p.variations || [],
          price: p.price ?? '',
          old_price: p.old_price ?? '',
          msrp: p.msrp ?? '',
          sku: p.sku || '',
          stock: p.stock ?? '',
          low_stock_threshold: p.low_stock_threshold ?? 5,
          fulfillment_method: p.fulfillment_method || 'FBM',
        })
        setStatus(p.status || 'published')
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, id, user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updateBullet(index, value) {
    setForm((f) => {
      const next = [...f.bullet_points]
      next[index] = value
      return { ...f, bullet_points: next }
    })
  }

  function addAdditionalImage() {
    setForm((f) => ({ ...f, additional_images: [...f.additional_images, ''] }))
  }

  function updateAdditionalImage(index, value) {
    setForm((f) => {
      const next = [...f.additional_images]
      next[index] = value
      return { ...f, additional_images: next }
    })
  }

  function removeAdditionalImage(index) {
    setForm((f) => ({
      ...f,
      additional_images: f.additional_images.filter((_, i) => i !== index),
    }))
  }

  function addVariation() {
    setForm((f) => ({
      ...f,
      variations: [...f.variations, { name: '', options: '' }],
    }))
  }

  function updateVariation(index, field, value) {
    setForm((f) => {
      const next = [...f.variations]
      next[index] = { ...next[index], [field]: value }
      return { ...f, variations: next }
    })
  }

  function removeVariation(index) {
    setForm((f) => ({
      ...f,
      variations: f.variations.filter((_, i) => i !== index),
    }))
  }

  function validate() {
    if (!form.title.trim()) return 'Product title is required'
    if (!form.price || Number(form.price) <= 0) return 'Price must be greater than 0'
    if (form.stock === '' || Number(form.stock) < 0) return 'Stock must be 0 or more'
    return null
  }

  async function handleSave(nextStatus) {
    const err = validate()
    if (err) return setError(err)
    if (!user) return setError('You must be signed in')

    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      bullet_points: form.bullet_points.filter((b) => b.trim()),
      additional_images: form.additional_images.filter((i) => i.trim()),
    }

    try {
      if (isEdit) {
        await updateSellerProduct(user.id, id, {
          ...payload,
          ...(nextStatus ? { status: nextStatus, is_active: nextStatus === 'published' } : {}),
        })
        pushToast(nextStatus === 'draft' ? 'Draft saved' : 'Product updated', { type: 'success' })
        if (nextStatus) setStatus(nextStatus)
      } else {
        const created = await createSellerProduct(user.id, payload, nextStatus || 'draft')
        pushToast(
          nextStatus === 'published' ? 'Product published' : 'Draft saved',
          { type: 'success' }
        )
        navigate(`/seller/products/${created.id}/edit`, { replace: true })
      }
    } catch (e) {
      setError(e.message || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading product…</div>
  }

  return (
    <div className="max-w-5xl space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/products"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit product' : 'Add a new product'}
          </h1>
          <p className="text-sm text-gray-600">
            {isEdit
              ? 'Update this listing. Changes go live immediately when status is Published.'
              : 'Create a new listing for the Amazon Rebuild marketplace.'}
          </p>
        </div>
        <span
          className={
            'text-xs font-bold px-3 py-1 rounded-full ' +
            (status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600')
          }
        >
          {status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Sections */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y">
        {/* Basic information */}
        <Section
          title="Basic information"
          open={openSections.basic}
          onToggle={() => toggleSection('basic')}
        >
          <Field label="Product title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Wireless Bluetooth Headphones with Noise Isolation, 40-Hour Battery"
              className="input"
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Brand">
              <input
                type="text"
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                placeholder="e.g. SoundPro"
                className="input"
              />
            </Field>
            <Field label="Manufacturer">
              <input
                type="text"
                value={form.manufacturer}
                onChange={(e) => update('manufacturer', e.target.value)}
                placeholder="e.g. SoundPro Industries"
                className="input"
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Product type">
              <input
                type="text"
                value={form.product_type}
                onChange={(e) => update('product_type', e.target.value)}
                placeholder="e.g. Over-ear headphones"
                className="input"
              />
            </Field>
          </div>
        </Section>

        {/* Details & description */}
        <Section
          title="Details & description"
          open={openSections.details}
          onToggle={() => toggleSection('details')}
        >
          <Field label="Product description">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe what makes this product great. Mention key features and benefits."
              className="input resize-none"
            />
          </Field>

          <Field label="Bullet points (up to 5)">
            <div className="space-y-2">
              {form.bullet_points.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-6 text-right text-sm text-gray-500 pt-2">{i + 1}.</span>
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    placeholder={`Key feature #${i + 1}`}
                    className="input flex-1"
                  />
                </div>
              ))}
            </div>
          </Field>

          <Field label="Search keywords">
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => update('keywords', e.target.value)}
              placeholder="wireless, bluetooth, headphones, noise cancelling"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate keywords with commas. These help shoppers find your product.
            </p>
          </Field>
        </Section>

        {/* Images */}
        <Section
          title="Images"
          open={openSections.images}
          onToggle={() => toggleSection('images')}
        >
          <Field label="Main image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)}
              placeholder="https://..."
              className="input"
            />
          </Field>
          {form.image_url && (
            <div className="w-32 h-32 rounded overflow-hidden border bg-gray-50">
              <img src={form.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <Field label="Additional images">
            <div className="space-y-2">
              {form.additional_images.map((img, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateAdditionalImage(i, e.target.value)}
                    placeholder="https://..."
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(i)}
                    className="p-2 border border-gray-300 rounded hover:bg-red-50 hover:border-red-300"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAdditionalImage}
                className="text-sm text-[#007185] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add another image
              </button>
            </div>
          </Field>
        </Section>

        {/* Variations */}
        <Section
          title="Variations (optional)"
          open={openSections.variations}
          onToggle={() => toggleSection('variations')}
        >
          <p className="text-xs text-gray-500 mb-2">
            Add variations like Color, Size, or Style to create a parent listing with options.
          </p>
          <div className="space-y-3">
            {form.variations.map((v, i) => (
              <div key={i} className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => updateVariation(i, 'name', e.target.value)}
                  placeholder="Variation name (e.g. Color)"
                  className="input"
                />
                <input
                  type="text"
                  value={v.options}
                  onChange={(e) => updateVariation(i, 'options', e.target.value)}
                  placeholder="Comma-separated options (e.g. Black, White, Blue)"
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => removeVariation(i)}
                  className="p-2 border border-gray-300 rounded hover:bg-red-50 hover:border-red-300"
                  aria-label="Remove variation"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariation}
              className="text-sm text-[#007185] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add variation
            </button>
          </div>
        </Section>

        {/* Pricing */}
        <Section
          title="Pricing"
          open={openSections.pricing}
          onToggle={() => toggleSection('pricing')}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Your price (USD)">
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="49.99"
                className="input"
              />
            </Field>
            <Field label="Sale price (optional)">
              <input
                type="number"
                step="0.01"
                value={form.old_price}
                onChange={(e) => update('old_price', e.target.value)}
                placeholder="69.99"
                className="input"
              />
            </Field>
            <Field label="MSRP (optional)">
              <input
                type="number"
                step="0.01"
                value={form.msrp}
                onChange={(e) => update('msrp', e.target.value)}
                placeholder="89.99"
                className="input"
              />
            </Field>
          </div>
          <p className="text-xs text-gray-500">
            "Sale price" displays as a strike-through on the product page. If MSRP is set,
            it shows as the list price.
          </p>
        </Section>

        {/* Inventory */}
        <Section
          title="Inventory"
          open={openSections.inventory}
          onToggle={() => toggleSection('inventory')}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="SKU (internal reference)">
              <input
                type="text"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder="HP-001"
                className="input"
              />
            </Field>
            <Field label="Quantity available">
              <input
                type="number"
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
                placeholder="50"
                className="input"
              />
            </Field>
            <Field label="Low stock threshold">
              <input
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => update('low_stock_threshold', e.target.value)}
                placeholder="5"
                className="input"
              />
            </Field>
          </div>
          <p className="text-xs text-gray-500">
            You'll be notified when stock drops below this threshold.
          </p>
        </Section>

        {/* Fulfillment */}
        <Section
          title="Fulfillment"
          open={openSections.fulfillment}
          onToggle={() => toggleSection('fulfillment')}
        >
          <div className="grid md:grid-cols-2 gap-3">
            <FulfillmentCard
              title="Fulfillment by Amazon (FBA)"
              desc="Amazon stores, picks, packs, and ships."
              value="FBA"
              selected={form.fulfillment_method === 'FBA'}
              onSelect={() => update('fulfillment_method', 'FBA')}
            />
            <FulfillmentCard
              title="Fulfilled by Merchant (FBM)"
              desc="You pack and ship orders yourself."
              value="FBM"
              selected={form.fulfillment_method === 'FBM'}
              onSelect={() => update('fulfillment_method', 'FBM')}
            />
          </div>
        </Section>
      </div>

      {/* AI hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>Coming in Module 7:</strong> the AI Listing Assistant will generate your
          title, bullet points, description, and keywords from a short prompt.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      {/* Sticky footer actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-3 flex items-center justify-end gap-3">
        <Link
          to="/seller/products"
          className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button
          onClick={() => handleSave('published')}
          disabled={saving}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded flex items-center gap-2 disabled:opacity-60 transition"
        >
          <Upload className="w-4 h-4" />
          {saving ? 'Publishing…' : isEdit && status === 'published' ? 'Save changes' : 'Publish product'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, open, onToggle, children }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 text-left"
      >
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <ChevronDown
          className={
            'w-5 h-5 text-gray-500 transition-transform ' + (open ? '' : '-rotate-90')
          }
        />
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
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

function FulfillmentCard({ title, desc, value, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        'text-left p-4 rounded-lg border-2 transition ' +
        (selected
          ? 'border-[#c7511f] bg-orange-50'
          : 'border-gray-200 hover:border-gray-400 bg-white')
      }
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={
            'w-4 h-4 rounded-full border-2 flex items-center justify-center ' +
            (selected ? 'border-[#c7511f]' : 'border-gray-300')
          }
        >
          {selected && <span className="w-2 h-2 rounded-full bg-[#c7511f]" />}
        </span>
        <span className="font-bold text-gray-900">{title}</span>
      </div>
      <p className="text-sm text-gray-600 ml-6">{desc}</p>
    </button>
  )
}