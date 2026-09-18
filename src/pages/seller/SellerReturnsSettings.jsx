import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Save,
  Settings as SettingsIcon,
  Bell,
  RotateCcw,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getReturnSettings,
  saveReturnSettings,
} from '../../services/sellerService'

const DEFAULTS = {
  business_name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'Pakistan',
  returnless_refund: true,
  replacement_requests: true,
  return_notifications: true,
  return_window_days: 30,
  default_return_method: 'prepaid_label',
  refund_preference: 'full',
}

export default function SellerReturnsSettings() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    getReturnSettings(user.id)
      .then((s) => {
        if (s) setForm({ ...DEFAULTS, ...s })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveReturnSettings(user.id, {
        business_name: form.business_name,
        street: form.street,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        return_address: [
          form.business_name,
          form.street,
          form.city,
          form.state,
          form.zip,
          form.country,
        ]
          .filter(Boolean)
          .join(', '),
        returnless_refund: form.returnless_refund,
        replacement_requests: form.replacement_requests,
        return_notifications: form.return_notifications,
        return_window_days: Number(form.return_window_days) || 30,
        default_return_method: form.default_return_method,
        refund_preference: form.refund_preference,
      })
      pushToast('Return settings saved', { type: 'success' })
    } catch (err) {
      pushToast('Could not save settings', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading settings…</div>
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/seller/orders/returns"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Return Settings</h1>
          <p className="text-sm text-gray-600">
            Configure your return address, preferences, and policy defaults.
          </p>
        </div>
      </div>

      {/* Return address */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Return Address
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          This address is used when you authorize a return. Keep it current — the
          address active when a return is requested determines where the item is
          sent.
        </p>

        <div className="space-y-4">
          <Field label="Business name">
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => update('business_name', e.target.value)}
              placeholder="Returns Department"
              className="input"
            />
          </Field>
          <Field label="Street address">
            <input
              type="text"
              value={form.street}
              onChange={(e) => update('street', e.target.value)}
              placeholder="123 Warehouse Rd"
              className="input"
            />
          </Field>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="City">
              <input
                type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="State / Region">
              <input
                type="text"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Postal code">
              <input
                type="text"
                value={form.zip}
                onChange={(e) => update('zip', e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Country">
            <input
              type="text"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Return preferences */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" /> Return Preferences
        </h2>
        <div className="space-y-1 divide-y">
          <Toggle
            icon={RefreshCw}
            title="Returnless refunds"
            description="Allow refunding customers without requiring them to ship the item back."
            value={form.returnless_refund}
            onChange={(v) => update('returnless_refund', v)}
          />
          <Toggle
            icon={RotateCcw}
            title="Replacement requests"
            description="Allow customers to request a replacement instead of a refund."
            value={form.replacement_requests}
            onChange={(v) => update('replacement_requests', v)}
          />
          <Toggle
            icon={Bell}
            title="Return notifications"
            description="Send an email whenever a return is requested or updated."
            value={form.return_notifications}
            onChange={(v) => update('return_notifications', v)}
          />
        </div>
      </section>

      {/* Return rules */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Return Rules
        </h2>

        <div className="space-y-4">
          <Field label="Return window (days)">
            <input
              type="number"
              value={form.return_window_days}
              onChange={(e) => update('return_window_days', e.target.value)}
              min={7}
              max={90}
              className="input max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of days a customer has to request a return.
            </p>
          </Field>

          <Field label="Default return method">
            <select
              value={form.default_return_method}
              onChange={(e) => update('default_return_method', e.target.value)}
              className="input max-w-xs"
            >
              <option value="prepaid_label">Amazon prepaid label</option>
              <option value="seller_label">Seller-provided label</option>
            </select>
          </Field>

          <Field label="Refund preference">
            <select
              value={form.refund_preference}
              onChange={(e) => update('refund_preference', e.target.value)}
              className="input max-w-xs"
            >
              <option value="full">Full refund by default</option>
              <option value="partial">Partial refund by default</option>
              <option value="case_by_case">Case by case</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded flex items-center gap-2 disabled:opacity-60 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ icon: Icon, title, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />}
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={
          'relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0 ' +
          (value ? 'bg-[#c7511f]' : 'bg-gray-300')
        }
        aria-pressed={value}
      >
        <span
          className={
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' +
            (value ? 'translate-x-5' : '')
          }
        />
      </button>
    </div>
  )
}