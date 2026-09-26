import { useEffect, useState } from 'react'
import {
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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { getReturnSettings, saveReturnSettings } from '../../services/sellerService'

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

const selectCls =
  'w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400'

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
        return_address: [form.business_name, form.street, form.city, form.state, form.zip, form.country]
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
    } catch {
      pushToast('Could not save settings', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-3xl animate-fade-in">
        <div className="h-14 rounded-xl skeleton-shimmer" />
        <div className="h-56 rounded-xl skeleton-shimmer" />
        <div className="h-40 rounded-xl skeleton-shimmer" />
        <div className="h-48 rounded-xl skeleton-shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
      <SellerPageHeader
        backTo="/seller/orders/returns"
        title="Return Settings"
        description="Configure your return address, preferences, and policy defaults."
      />

      <Card
        title={
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-charcoal-500" /> Return Address
          </span>
        }
        subtitle="This address is used when you authorize a return. Keep it current — the address active when a return is requested determines where the item is sent."
      >
        <div className="space-y-4">
          <Input
            label="Business name"
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            placeholder="Returns Department"
          />
          <Input
            label="Street address"
            value={form.street}
            onChange={(e) => update('street', e.target.value)}
            placeholder="123 Warehouse Rd"
          />
          <div className="grid md:grid-cols-3 gap-3">
            <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
            <Input label="State / Region" value={form.state} onChange={(e) => update('state', e.target.value)} />
            <Input label="Postal code" value={form.zip} onChange={(e) => update('zip', e.target.value)} />
          </div>
          <Input label="Country" value={form.country} onChange={(e) => update('country', e.target.value)} />
        </div>
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-charcoal-500" /> Return Preferences
          </span>
        }
      >
        <div className="divide-y divide-stone-200">
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
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-charcoal-500" /> Return Rules
          </span>
        }
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Return window (days)"
              type="number"
              value={form.return_window_days}
              onChange={(e) => update('return_window_days', e.target.value)}
              min={7}
              max={90}
              className="max-w-xs"
              hint="Number of days a customer has to request a return."
            />
          </div>

          <div className="max-w-xs">
            <label className="block text-label mb-1.5">Default return method</label>
            <select
              value={form.default_return_method}
              onChange={(e) => update('default_return_method', e.target.value)}
              className={selectCls}
            >
              <option value="prepaid_label">Amazon prepaid label</option>
              <option value="seller_label">Seller-provided label</option>
            </select>
          </div>

          <div className="max-w-xs">
            <label className="block text-label mb-1.5">Refund preference</label>
            <select
              value={form.refund_preference}
              onChange={(e) => update('refund_preference', e.target.value)}
              className={selectCls}
            >
              <option value="full">Full refund by default</option>
              <option value="partial">Partial refund by default</option>
              <option value="case_by_case">Case by case</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Save settings
        </Button>
      </div>
    </div>
  )
}

function Toggle({ icon, title, description, value, onChange }) {
  const Icon = icon
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-4 h-4 text-charcoal-400 mt-1 flex-shrink-0" />}
        <div>
          <div className="text-sm font-medium text-charcoal-900">{title}</div>
          <div className="text-xs text-charcoal-500 mt-0.5">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={
          'relative inline-flex h-6 w-11 rounded-full transition-avenzo flex-shrink-0 ' +
          (value ? 'bg-brass-500' : 'bg-stone-300')
        }
        aria-pressed={value}
      >
        <span
          className={
            'absolute top-0.5 left-0.5 w-5 h-5 bg-bone-50 rounded-full shadow-subtle transition-transform duration-base ' +
            (value ? 'translate-x-5' : '')
          }
        />
      </button>
    </div>
  )
}
