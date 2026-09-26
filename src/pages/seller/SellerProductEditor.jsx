import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AIListingAssistant from '../../components/seller/AIListingAssistant'
import {
  Plus,
  X,
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
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'

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

  function handleAIApply(field, value) {
    if (field === '__all__') {
      setForm((f) => ({
        ...f,
        title: value.title || f.title,
        bullet_points:
          value.bullet_points && value.bullet_points.length
            ? [...value.bullet_points, '', '', '', '', ''].slice(0, 5)
            : f.bullet_points,
        description: value.description || f.description,
        keywords: value.keywords || f.keywords,
      }))
      return
    }

    if (field === 'bullet_points') {
      setForm((f) => ({
        ...f,
        bullet_points: [...value, '', '', '', '', ''].slice(0, 5),
      }))
      return
    }

    setForm((f) => ({ ...f, [field]: value }))
  }

  if (loading) {
    return (
      <div className="max-w-5xl space-y-4">
        <div className="h-10 w-64 rounded-lg skeleton-shimmer" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-5 pb-20">
      <SellerPageHeader
        backTo="/seller/products"
        title={isEdit ? 'Edit product' : 'Add a new product'}
        description={
          isEdit
            ? 'Update this listing. Changes go live immediately when status is Published.'
            : 'Create a new listing for the Avenzo marketplace.'
        }
        actions={<Badge color={status === 'published' ? 'green' : 'gray'}>{status === 'published' ? 'Published' : 'Draft'}</Badge>}
      />

      {/* Sections */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle divide-y divide-stone-200">
        {/* Basic information */}
        <Section title="Basic information" open={openSections.basic} onToggle={() => toggleSection('basic')}>
          <Input
            label="Product title"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Wireless Bluetooth Headphones with Noise Isolation, 40-Hour Battery"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Brand"
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              placeholder="e.g. SoundPro"
            />
            <Input
              label="Manufacturer"
              value={form.manufacturer}
              onChange={(e) => update('manufacturer', e.target.value)}
              placeholder="e.g. SoundPro Industries"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Input
              label="Product type"
              value={form.product_type}
              onChange={(e) => update('product_type', e.target.value)}
              placeholder="e.g. Over-ear headphones"
            />
          </div>
        </Section>

        {/* Details & description */}
        <Section title="Details & description" open={openSections.details} onToggle={() => toggleSection('details')}>
          <Field label="Product description">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe what makes this product great. Mention key features and benefits."
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 resize-none"
            />
          </Field>

          <Field label="Bullet points (up to 5)">
            <div className="space-y-2">
              {form.bullet_points.map((b, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-5 text-right text-sm text-charcoal-400 flex-shrink-0">{i + 1}.</span>
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    placeholder={`Key feature #${i + 1}`}
                    className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 flex-1"
                  />
                </div>
              ))}
            </div>
          </Field>

          <Input
            label="Search keywords"
            value={form.keywords}
            onChange={(e) => update('keywords', e.target.value)}
            placeholder="wireless, bluetooth, headphones, noise cancelling"
            hint="Separate keywords with commas. These help shoppers find your product."
          />
        </Section>

        {/* Images */}
        <Section title="Images" open={openSections.images} onToggle={() => toggleSection('images')}>
          <Input
            label="Main image URL"
            type="url"
            value={form.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            placeholder="https://..."
          />
          {form.image_url && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
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
                    className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(i)}
                    className="p-2.5 border border-stone-300 rounded-lg hover:bg-error-50 hover:border-error-300 transition-avenzo"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-error-600" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAdditionalImage}
                className="text-sm text-brass-600 hover:text-brass-700 transition-avenzo inline-flex items-center gap-1 font-medium"
              >
                <Plus className="w-4 h-4" /> Add another image
              </button>
            </div>
          </Field>
        </Section>

        {/* Variations */}
        <Section title="Variations (optional)" open={openSections.variations} onToggle={() => toggleSection('variations')}>
          <p className="text-caption">
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
                  className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400"
                />
                <input
                  type="text"
                  value={v.options}
                  onChange={(e) => updateVariation(i, 'options', e.target.value)}
                  placeholder="Comma-separated options (e.g. Black, White, Blue)"
                  className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400"
                />
                <button
                  type="button"
                  onClick={() => removeVariation(i)}
                  className="p-2.5 border border-stone-300 rounded-lg hover:bg-error-50 hover:border-error-300 transition-avenzo"
                  aria-label="Remove variation"
                >
                  <X className="w-4 h-4 text-error-600" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariation}
              className="text-sm text-brass-600 hover:text-brass-700 transition-avenzo inline-flex items-center gap-1 font-medium"
            >
              <Plus className="w-4 h-4" /> Add variation
            </button>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing" open={openSections.pricing} onToggle={() => toggleSection('pricing')}>
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Your price (USD)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              placeholder="49.99"
            />
            <Input
              label="Sale price (optional)"
              type="number"
              step="0.01"
              value={form.old_price}
              onChange={(e) => update('old_price', e.target.value)}
              placeholder="69.99"
            />
            <Input
              label="MSRP (optional)"
              type="number"
              step="0.01"
              value={form.msrp}
              onChange={(e) => update('msrp', e.target.value)}
              placeholder="89.99"
            />
          </div>
          <p className="text-caption">
            "Sale price" displays as a strike-through on the product page. If MSRP is set, it
            shows as the list price.
          </p>
        </Section>

        {/* Inventory */}
        <Section title="Inventory" open={openSections.inventory} onToggle={() => toggleSection('inventory')}>
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="SKU (internal reference)"
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              placeholder="HP-001"
            />
            <Input
              label="Quantity available"
              type="number"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              placeholder="50"
            />
            <Input
              label="Low stock threshold"
              type="number"
              value={form.low_stock_threshold}
              onChange={(e) => update('low_stock_threshold', e.target.value)}
              placeholder="5"
            />
          </div>
          <p className="text-caption">You'll be notified when stock drops below this threshold.</p>
        </Section>

        {/* Fulfillment */}
        <Section title="Fulfillment" open={openSections.fulfillment} onToggle={() => toggleSection('fulfillment')}>
          <div className="grid md:grid-cols-2 gap-3">
            <FulfillmentCard
              title="Fulfillment by Avenzo (FBA)"
              desc="Avenzo stores, picks, packs, and ships."
              selected={form.fulfillment_method === 'FBA'}
              onSelect={() => update('fulfillment_method', 'FBA')}
            />
            <FulfillmentCard
              title="Fulfilled by Merchant (FBM)"
              desc="You pack and ship orders yourself."
              selected={form.fulfillment_method === 'FBM'}
              onSelect={() => update('fulfillment_method', 'FBM')}
            />
          </div>
        </Section>
      </div>

      {/* AI hint */}
      <div className="bg-info-50 border border-info-500/25 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-info-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info-700">
          <strong>AI Listing Assistant</strong> is available — use the floating button in the
          bottom-right to generate your title, bullet points, description, and keywords.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-error-700 bg-error-50 border border-error-500/25 rounded-xl p-3">
          {error}
        </div>
      )}

      {/* Sticky footer actions */}
      <div className="sticky bottom-0 bg-bone-50/95 backdrop-blur border-t border-stone-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end gap-3">
        <Link
          to="/seller/products"
          className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-stone-300 bg-bone-50 text-charcoal-800 text-sm font-medium hover:bg-stone-100 hover:border-stone-400 transition-avenzo"
        >
          Cancel
        </Link>
        <Button variant="outline" onClick={() => handleSave('draft')} loading={saving}>
          Save draft
        </Button>
        <Button variant="secondary" onClick={() => handleSave('published')} loading={saving}>
          <Upload className="w-4 h-4" />
          {isEdit && status === 'published' ? 'Save changes' : 'Publish product'}
        </Button>
      </div>

      {/* AI Listing Assistant — floating panel */}
      <AIListingAssistant
        form={form}
        categoryName={categories.find((c) => c.id === form.category_id)?.name || ''}
        onApply={handleAIApply}
      />
    </div>
  )
}

function Section({ title, open, onToggle, children }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-avenzo text-left"
      >
        <h2 className="heading-sub">{title}</h2>
        <ChevronDown
          className={'w-4 h-4 text-charcoal-400 transition-transform duration-base ' + (open ? '' : '-rotate-90')}
        />
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-label mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function FulfillmentCard({ title, desc, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        'text-left p-4 rounded-xl border-2 transition-avenzo ' +
        (selected ? 'border-brass-400 bg-brass-50' : 'border-stone-200 hover:border-stone-400 bg-bone-50')
      }
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' +
            (selected ? 'border-brass-500' : 'border-stone-300')
          }
        >
          {selected && <span className="w-2 h-2 rounded-full bg-brass-500" />}
        </span>
        <span className="font-semibold text-charcoal-900">{title}</span>
      </div>
      <p className="text-body-sm ml-6">{desc}</p>
    </button>
  )
}
