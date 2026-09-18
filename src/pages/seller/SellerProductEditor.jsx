import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getAllCategories } from '../../services/categoryService'
import {
  createSellerProduct,
  getSellerProduct,
  updateSellerProduct,
} from '../../services/sellerService'

const EMPTY = {
  title: '',
  brand: '',
  category_id: '',
  description: '',
  price: '',
  old_price: '',
  stock: '',
  image_url: '',
  sku: '',
}

export default function SellerProductEditor() {
  const { id } = useParams() // present on /edit, undefined on /new
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

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
          category_id: p.category_id || '',
          description: p.description || '',
          price: p.price ?? '',
          old_price: p.old_price ?? '',
          stock: p.stock ?? '',
          image_url: p.image_url || '',
          sku: p.sku || '',
        })
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

  function validate() {
    if (!form.title.trim()) return 'Product title is required'
    if (!form.price || Number(form.price) <= 0) return 'Price must be greater than 0'
    if (form.stock === '' || Number(form.stock) < 0) return 'Stock must be 0 or more'
    return null
  }

  async function handleSave() {
    const err = validate()
    if (err) return setError(err)
    if (!user) return setError('You must be signed in')

    setSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await updateSellerProduct(user.id, id, form)
        pushToast('Product updated', { type: 'success' })
      } else {
        const created = await createSellerProduct(user.id, form)
        pushToast('Product published', { type: 'success' })
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
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/seller/products"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit product' : 'Add a new product'}
          </h1>
          <p className="text-sm text-gray-600">
            {isEdit ? 'Update the details of this listing.' : 'Create a new listing for the Amazon marketplace.'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Basic info */}
        <Section title="Basic information">
          <Field label="Product title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Wireless Bluetooth Headphones"
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
            <Field label="SKU (internal reference)">
              <input
                type="text"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder="HP-001"
                className="input"
              />
            </Field>
          </div>

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

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe what makes this product great..."
              className="input resize-none"
            />
          </Field>
        </Section>

        {/* Images */}
        <Section title="Product image">
          <Field label="Image URL">
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
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid md:grid-cols-2 gap-4">
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
            <Field label="Compare-at price (optional)">
              <input
                type="number"
                step="0.01"
                value={form.old_price}
                onChange={(e) => update('old_price', e.target.value)}
                placeholder="69.99"
                className="input"
              />
            </Field>
          </div>
        </Section>

        {/* Inventory */}
        <Section title="Inventory">
          <Field label="Quantity available">
            <input
              type="number"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              placeholder="50"
              className="input"
            />
          </Field>
        </Section>

        {/* AI hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Tip:</strong> Use the AI Listing Assistant (coming in a later module) to
            generate a polished title, bullet points, and description.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            to="/seller/products"
            className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded flex items-center gap-2 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish product'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b">{title}</h2>
      <div className="space-y-4">{children}</div>
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