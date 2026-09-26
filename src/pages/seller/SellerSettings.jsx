import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Lock,
  Users,
  Bell,
  Truck,
  RotateCcw,
  FileCheck2,
  PackageCheck,
  CreditCard,
  Receipt,
  Save,
  Shield,
  Check,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerProfile, updateSellerSettings } from '../../services/sellerService'
import { supabase } from '../../services/supabase'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'

const SECTIONS = [
  { id: 'account', label: 'Account Information', icon: User },
  { id: 'security', label: 'Login & Security', icon: Lock },
  { id: 'users', label: 'User Permissions', icon: Users },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  { id: 'shipping', label: 'Shipping Settings', icon: Truck },
  { id: 'returns', label: 'Return Settings', icon: RotateCcw },
  { id: 'tax', label: 'Tax Settings', icon: FileCheck2 },
  { id: 'fulfillment', label: 'Fulfillment Settings', icon: PackageCheck },
  { id: 'payments', label: 'Payment Settings', icon: CreditCard },
  { id: 'plan', label: 'Selling Plan', icon: Receipt },
]

export default function SellerSettings() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [section, setSection] = useState('account')
  const [, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const s = await getSellerProfile(user.id)
      setSeller(s)
      setForm(s || {})
    } catch {
      pushToast('Could not load settings', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function save(updates) {
    setSaving(true)
    try {
      await updateSellerSettings(user.id, updates || form)
      pushToast('Settings saved', { type: 'success' })
      await load()
    } catch (err) {
      pushToast(err.message || 'Could not save', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-48 rounded-lg skeleton-shimmer" />
        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <div className="h-80 rounded-xl skeleton-shimmer" />
          <div className="h-96 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Settings"
        description="Manage your seller account, preferences, and store options."
      />

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar nav */}
        <Card padding="sm" className="self-start" hoverable={false}>
          <nav className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const active = section === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={
                    'w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg text-sm font-medium transition-avenzo ' +
                    (active
                      ? 'bg-stone-100 text-charcoal-900'
                      : 'text-charcoal-600 hover:bg-stone-50 hover:text-charcoal-900')
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Right pane */}
        <div>
          {section === 'account' && (
            <AccountSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'security' && <SecuritySection user={user} pushToast={pushToast} />}
          {section === 'users' && (
            <Card
              title="User Permissions"
              subtitle="Manage who can access your seller account."
            >
              <div className="text-center py-6">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-charcoal-400" strokeWidth={1.5} />
                </div>
                <p className="text-body-sm mb-4">
                  Full permission management is on a dedicated page.
                </p>
                <Link
                  to="/seller/settings/users"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium bg-charcoal-900 text-bone-50 hover:bg-charcoal-800 transition-avenzo"
                >
                  Manage Users
                </Link>
              </div>
            </Card>
          )}
          {section === 'notifications' && (
            <NotificationsSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'shipping' && (
            <ShippingSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'returns' && (
            <ReturnsSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'tax' && <TaxSection form={form} update={update} save={save} saving={saving} />}
          {section === 'fulfillment' && (
            <FulfillmentSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'payments' && (
            <PaymentsSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'plan' && <PlanSection form={form} save={save} saving={saving} />}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Sections
   ============================================================ */

function SectionCard({ title, description, children, onSave, saving, saveLabel = 'Save changes' }) {
  return (
    <Card
      title={title}
      subtitle={description}
      footer={
        onSave ? (
          <div className="flex justify-end">
            <Button onClick={onSave} loading={saving}>
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : saveLabel}
            </Button>
          </div>
        ) : undefined
      }
    >
      {children}
    </Card>
  )
}

function SelectField({ label, hint, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-label mb-1.5">{label}</label>}
      <select
        className={
          'w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 ' +
          'transition-avenzo focus:outline-none focus:border-brass-400 ' +
          className
        }
        {...props}
      />
      {hint && <p className="text-caption mt-1.5">{hint}</p>}
    </div>
  )
}

function AccountSection({ form, update, save, saving }) {
  return (
    <SectionCard
      title="Account Information"
      description="Your business details and contact information."
      onSave={() => save()}
      saving={saving}
    >
      <div className="space-y-4">
        <Input
          label="Store name"
          value={form.store_name || ''}
          onChange={(e) => update('store_name', e.target.value)}
        />
        <Input
          label="Full name"
          value={form.full_name || ''}
          onChange={(e) => update('full_name', e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Business name"
            value={form.business_name || ''}
            onChange={(e) => update('business_name', e.target.value)}
          />
          <Input
            label="Business phone"
            value={form.business_phone || ''}
            onChange={(e) => update('business_phone', e.target.value)}
          />
        </div>
        <Input
          label="Business address"
          value={form.business_address || ''}
          onChange={(e) => update('business_address', e.target.value)}
        />
      </div>
    </SectionCard>
  )
}

function SecuritySection({ user, pushToast }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  async function changePassword() {
    if (newPassword.length < 6)
      return pushToast('Password must be at least 6 characters', { type: 'error' })
    if (newPassword !== confirm) return pushToast('Passwords do not match', { type: 'error' })

    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      pushToast('Password updated', { type: 'success' })
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      pushToast(err.message || 'Could not update password', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Login & Security" subtitle="Manage your login credentials and account security.">
      <div className="space-y-5">
        <Input label="Email" type="email" value={user?.email || ''} disabled hint="Email cannot be changed here." />

        <div className="border-t border-stone-200 pt-5">
          <h3 className="heading-sub mb-3">Change password</h3>
          <div className="space-y-3 max-w-md">
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button size="sm" onClick={changePassword} loading={busy} disabled={!newPassword}>
              {busy ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <h3 className="heading-sub mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-success-500" /> Two-step verification
          </h3>
          <p className="text-body-sm">
            Not available in this demo. In production this would enable SMS or authenticator-app
            verification.
          </p>
        </div>
      </div>
    </Card>
  )
}

function NotificationsSection({ form, update, save, saving }) {
  const prefs = form.notification_prefs || {}

  const TOGGLES = [
    { id: 'new_orders', label: 'New orders', desc: 'Alert when a customer places an order.' },
    { id: 'low_stock', label: 'Low inventory alerts', desc: 'Alert when stock drops below threshold.' },
    { id: 'returns', label: 'Returns & refunds', desc: 'Alert when a customer returns an item.' },
    { id: 'messages', label: 'Customer messages', desc: 'Alert when a buyer sends a message.' },
    { id: 'payments', label: 'Payout updates', desc: 'Alert when payouts are scheduled or completed.' },
    { id: 'policy', label: 'Policy notifications', desc: 'Alert for account health and compliance.' },
    { id: 'marketing', label: 'Product announcements', desc: 'Occasional tips and new seller features.' },
  ]

  function toggle(id) {
    update('notification_prefs', { ...prefs, [id]: !prefs[id] })
  }

  return (
    <SectionCard
      title="Notification Preferences"
      description="Choose which alerts you want to receive."
      onSave={() => save()}
      saving={saving}
    >
      <ul className="divide-y divide-stone-100">
        {TOGGLES.map((t) => {
          const checked = prefs[t.id] !== false
          return (
            <li key={t.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <div className="text-sm font-medium text-charcoal-900">{t.label}</div>
                <div className="text-xs text-charcoal-500 mt-0.5">{t.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(t.id)}
                className={
                  'relative inline-flex h-6 w-11 rounded-full transition-avenzo flex-shrink-0 ' +
                  (checked ? 'bg-brass-500' : 'bg-stone-300')
                }
                aria-pressed={checked}
              >
                <span
                  className={
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-bone-50 rounded-full shadow-subtle transition-avenzo ' +
                    (checked ? 'translate-x-5' : '')
                  }
                />
              </button>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

function ShippingSection({ form, update, save, saving }) {
  return (
    <SectionCard
      title="Shipping Settings"
      description="Defaults for order handling and carrier selection."
      onSave={() => save()}
      saving={saving}
    >
      <div className="space-y-4 max-w-lg">
        <SelectField
          label="Default carrier"
          hint="Used when you print labels from Seller Central."
          value={form.default_carrier || 'Amazon Logistics'}
          onChange={(e) => update('default_carrier', e.target.value)}
        >
          <option>Amazon Logistics</option>
          <option>USPS</option>
          <option>UPS</option>
          <option>FedEx</option>
          <option>DHL</option>
        </SelectField>
        <Input
          label="Default handling time (days)"
          hint="Business days between order receipt and shipment."
          type="number"
          value={form.handling_time ?? 2}
          onChange={(e) => update('handling_time', Number(e.target.value))}
        />
      </div>
    </SectionCard>
  )
}

function ReturnsSection({ form, update, save, saving }) {
  return (
    <SectionCard
      title="Return Settings"
      description="How and when you accept returns."
      onSave={() => save()}
      saving={saving}
    >
      <div className="space-y-4 max-w-lg">
        <Input
          label="Return window (days)"
          hint="Number of days customers have to return an item."
          type="number"
          value={form.return_window_days ?? 30}
          onChange={(e) => update('return_window_days', Number(e.target.value))}
        />
        <SelectField
          label="Who pays return shipping"
          value={form.return_shipping_paid_by || 'seller'}
          onChange={(e) => update('return_shipping_paid_by', e.target.value)}
        >
          <option value="seller">Seller pays</option>
          <option value="customer">Customer pays</option>
          <option value="split">Split / case-by-case</option>
        </SelectField>
      </div>
    </SectionCard>
  )
}

function TaxSection({ form, update, save, saving }) {
  return (
    <SectionCard
      title="Tax Settings"
      description="Tax IDs and default sales tax rate (demo)."
      onSave={() => save()}
      saving={saving}
    >
      <div className="space-y-4 max-w-lg">
        <Input
          label="Tax ID"
          hint="Your business tax identification number."
          value={form.tax_id || ''}
          onChange={(e) => update('tax_id', e.target.value)}
          placeholder="e.g. 123-45-6789"
        />
        <Input
          label="Default tax rate (%)"
          hint="Applied to customer orders by default. Simulated in this demo."
          type="number"
          step="0.01"
          value={form.tax_rate ?? 0}
          onChange={(e) => update('tax_rate', Number(e.target.value))}
        />
        <div className="text-xs text-charcoal-500 bg-stone-50 border border-stone-200 rounded-lg p-3">
          Tax filing, remittance, and jurisdictional calculations are{' '}
          <strong className="text-charcoal-700">simulated</strong> in this demo.
        </div>
      </div>
    </SectionCard>
  )
}

function FulfillmentSection({ form, update, save, saving }) {
  const value = form.default_fulfillment || 'FBM'
  return (
    <SectionCard
      title="Fulfillment Settings"
      description="Default fulfillment method for new products."
      onSave={() => save()}
      saving={saving}
    >
      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
        {['FBM', 'FBA'].map((m) => (
          <button
            key={m}
            onClick={() => update('default_fulfillment', m)}
            className={
              'text-left border-2 rounded-xl p-4 transition-avenzo ' +
              (value === m ? 'border-brass-400 bg-brass-50' : 'border-stone-200 hover:border-stone-300')
            }
          >
            <div className="font-medium text-charcoal-900">
              {m === 'FBA' ? 'Fulfillment by Amazon (FBA)' : 'Fulfilled by Merchant (FBM)'}
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              {m === 'FBA'
                ? 'Amazon stores, packs, and ships your products.'
                : 'You handle storage, packing, and shipping.'}
            </p>
          </button>
        ))}
      </div>
    </SectionCard>
  )
}

function PaymentsSection({ form, update, save, saving }) {
  return (
    <SectionCard
      title="Payment Settings"
      description="Payout schedule and deposit account."
      onSave={() => save()}
      saving={saving}
    >
      <div className="space-y-4 max-w-lg">
        <SelectField
          label="Payout schedule"
          value={form.payout_schedule || 'biweekly'}
          onChange={(e) => update('payout_schedule', e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 14 days</option>
          <option value="monthly">Monthly</option>
        </SelectField>

        <Input
          label="Bank account (last 4 digits)"
          hint="Full account numbers are never stored in this demo."
          maxLength={4}
          value={form.bank_last4 || ''}
          onChange={(e) => update('bank_last4', e.target.value.replace(/\D/g, ''))}
          placeholder="••••"
        />

        <div className="text-xs text-charcoal-500 bg-stone-50 border border-stone-200 rounded-lg p-3">
          All payouts and deposits are <strong className="text-charcoal-700">simulated</strong>. No real
          funds move.
        </div>
      </div>
    </SectionCard>
  )
}

function PlanSection({ form, save, saving }) {
  const current = form.plan || 'individual'
  return (
    <Card title="Selling Plan" subtitle="Choose the plan that fits your business.">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            id: 'individual',
            label: 'Individual',
            price: '$0.99',
            unit: 'per item sold',
            features: ['List products', 'Manage orders', 'Manage inventory', 'Basic seller tools'],
          },
          {
            id: 'professional',
            label: 'Professional',
            price: '$39.99',
            unit: 'per month',
            features: [
              'Bulk listing',
              'Advanced reports',
              'Advertising',
              'Automate Pricing',
              'Advanced tools',
            ],
          },
        ].map((p) => {
          const active = current === p.id
          return (
            <div
              key={p.id}
              className={
                'border-2 rounded-xl p-6 flex flex-col transition-avenzo ' +
                (active ? 'border-brass-400 bg-brass-50' : 'border-stone-200')
              }
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="heading-sub text-lg">{p.label}</h3>
                {active && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-charcoal-900 text-bone-50">
                    CURRENT
                  </span>
                )}
              </div>
              <div className="my-3">
                <span className="font-display text-3xl text-charcoal-900">{p.price}</span>
                <span className="text-charcoal-500 ml-2 text-sm">{p.unit}</span>
              </div>
              <ul className="space-y-1.5 text-sm text-charcoal-700 mb-5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={active ? 'outline' : 'primary'}
                disabled={active || saving}
                onClick={() => save({ plan: p.id })}
              >
                {active ? 'Current plan' : 'Switch to ' + p.label}
              </Button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
