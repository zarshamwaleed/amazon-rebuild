import { useEffect, useMemo, useState } from 'react'
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
  Plus,
  Trash2,
  Save,
  X,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerProfile,
  updateSellerSettings,
  getSellerUsers,
  inviteSellerUser,
  removeSellerUser,
} from '../../services/sellerService'
import { supabase } from '../../services/supabase'

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
  const { user, profile } = useAuth()
  const { pushToast } = useToast()

  const [section, setSection] = useState('account')
  const [seller, setSeller] = useState(null)
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
    return <div className="text-sm text-gray-600">Loading settings…</div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">
          Manage your seller account, preferences, and store options.
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        {/* Sidebar nav */}
        <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden self-start">
          <ul>
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const active = section === s.id
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSection(s.id)}
                    className={
                      'w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition border-l-4 ' +
                      (active
                        ? 'border-[#febd69] bg-orange-50 text-[#c7511f] font-medium'
                        : 'border-transparent text-gray-700 hover:bg-gray-50')
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {s.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Right pane */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          {section === 'account' && (
            <AccountSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'security' && (
            <SecuritySection user={user} pushToast={pushToast} />
          )}
          {section === 'users' && (
            <UsersSection userId={user.id} pushToast={pushToast} />
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
          {section === 'tax' && (
            <TaxSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'fulfillment' && (
            <FulfillmentSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'payments' && (
            <PaymentsSection form={form} update={update} save={save} saving={saving} />
          )}
          {section === 'plan' && (
            <PlanSection form={form} save={save} saving={saving} />
          )}
        </section>
      </div>
    </div>
  )
}

/* ============================================================
   Sections
   ============================================================ */

function SectionHeader({ title, description }) {
  return (
    <div className="pb-4 border-b mb-5">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

function SaveRow({ onClick, saving, label = 'Save changes' }) {
  return (
    <div className="flex justify-end pt-5 border-t mt-6">
      <button
        onClick={onClick}
        disabled={saving}
        className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded flex items-center gap-2 disabled:opacity-60 transition"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : label}
      </button>
    </div>
  )
}

function AccountSection({ form, update, save, saving }) {
  return (
    <>
      <SectionHeader
        title="Account Information"
        description="Your business details and contact information."
      />
      <div className="space-y-4">
        <Field label="Store name">
          <input
            type="text"
            value={form.store_name || ''}
            onChange={(e) => update('store_name', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
        <Field label="Full name">
          <input
            type="text"
            value={form.full_name || ''}
            onChange={(e) => update('full_name', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name">
            <input
              type="text"
              value={form.business_name || ''}
              onChange={(e) => update('business_name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </Field>
          <Field label="Business phone">
            <input
              type="text"
              value={form.business_phone || ''}
              onChange={(e) => update('business_phone', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </Field>
        </div>
        <Field label="Business address">
          <input
            type="text"
            value={form.business_address || ''}
            onChange={(e) => update('business_address', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
      </div>
      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function SecuritySection({ user, pushToast }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  async function changePassword() {
    if (newPassword.length < 6)
      return pushToast('Password must be at least 6 characters', { type: 'error' })
    if (newPassword !== confirm)
      return pushToast('Passwords do not match', { type: 'error' })

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
    <>
      <SectionHeader
        title="Login & Security"
        description="Manage your login credentials and account security."
      />

      <div className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed here.</p>
        </Field>

        <div className="border-t pt-5">
          <h3 className="font-medium text-gray-900 mb-3">Change password</h3>
          <div className="space-y-3 max-w-md">
            <Field label="New password">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </Field>
            <button
              onClick={changePassword}
              disabled={busy || !newPassword}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded text-sm disabled:opacity-60 transition"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>

        <div className="border-t pt-5">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" /> Two-step verification
          </h3>
          <p className="text-sm text-gray-600">
            Not available in this demo. In production this would enable SMS or
            authenticator-app verification.
          </p>
        </div>
      </div>
    </>
  )
}

function UsersSection({ userId, pushToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const u = await getSellerUsers(userId)
      setUsers(u)
    } catch {
      pushToast('Could not load team', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [userId])

  async function handleRemove(id, email) {
    if (!confirm('Remove ' + email + ' from your team?')) return
    try {
      await removeSellerUser(userId, id)
      pushToast('Member removed', { type: 'info' })
      load()
    } catch {
      pushToast('Could not remove member', { type: 'error' })
    }
  }

  return (
    <>
      <SectionHeader
        title="User Permissions"
        description="Invite team members and manage their access."
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition"
        >
          <Plus className="w-4 h-4" /> Invite user
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading team…</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-gray-600 border border-dashed rounded p-6 text-center">
          No team members yet. Invite someone to get started.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 text-gray-900">
                    {u.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{u.role}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        'text-xs font-medium px-2 py-0.5 rounded-full ' +
                        (u.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : u.status === 'invited'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600')
                      }
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(u.id, u.email)}
                      className="p-1.5 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddUserModal
          userId={userId}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false)
            load()
          }}
        />
      )}
    </>
  )
}

function AddUserModal({ userId, onClose, onCreated }) {
  const { pushToast } = useToast()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Employee')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return setError('Email is required')
    setSaving(true)
    setError(null)
    try {
      await inviteSellerUser(userId, { email: email.trim(), full_name: fullName.trim(), role })
      pushToast('Invitation sent', { type: 'success' })
      onCreated()
    } catch (err) {
      setError(err.message || 'Could not invite user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Invite user</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </Field>
          <Field label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </Field>
          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option>Administrator</option>
              <option>Manager</option>
              <option>Employee</option>
              <option>Analyst</option>
            </select>
          </Field>
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded disabled:opacity-60 transition"
            >
              {saving ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <>
      <SectionHeader
        title="Notification Preferences"
        description="Choose which alerts you want to receive."
      />

      <ul className="divide-y">
        {TOGGLES.map((t) => {
          const checked = prefs[t.id] !== false
          return (
            <li
              key={t.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">{t.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(t.id)}
                className={
                  'relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0 ' +
                  (checked ? 'bg-[#c7511f]' : 'bg-gray-300')
                }
                aria-pressed={checked}
              >
                <span
                  className={
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' +
                    (checked ? 'translate-x-5' : '')
                  }
                />
              </button>
            </li>
          )
        })}
      </ul>

      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function ShippingSection({ form, update, save, saving }) {
  return (
    <>
      <SectionHeader
        title="Shipping Settings"
        description="Defaults for order handling and carrier selection."
      />
      <div className="space-y-4 max-w-lg">
        <Field
          label="Default carrier"
          hint="Used when you print labels from Seller Central."
        >
          <select
            value={form.default_carrier || 'Amazon Logistics'}
            onChange={(e) => update('default_carrier', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option>Amazon Logistics</option>
            <option>USPS</option>
            <option>UPS</option>
            <option>FedEx</option>
            <option>DHL</option>
          </select>
        </Field>
        <Field
          label="Default handling time (days)"
          hint="Business days between order receipt and shipment."
        >
          <input
            type="number"
            value={form.handling_time ?? 2}
            onChange={(e) => update('handling_time', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
      </div>
      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function ReturnsSection({ form, update, save, saving }) {
  return (
    <>
      <SectionHeader
        title="Return Settings"
        description="How and when you accept returns."
      />
      <div className="space-y-4 max-w-lg">
        <Field
          label="Return window (days)"
          hint="Number of days customers have to return an item."
        >
          <input
            type="number"
            value={form.return_window_days ?? 30}
            onChange={(e) => update('return_window_days', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
        <Field label="Who pays return shipping">
          <select
            value={form.return_shipping_paid_by || 'seller'}
            onChange={(e) => update('return_shipping_paid_by', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="seller">Seller pays</option>
            <option value="customer">Customer pays</option>
            <option value="split">Split / case-by-case</option>
          </select>
        </Field>
      </div>
      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function TaxSection({ form, update, save, saving }) {
  return (
    <>
      <SectionHeader
        title="Tax Settings"
        description="Tax IDs and default sales tax rate (demo)."
      />
      <div className="space-y-4 max-w-lg">
        <Field label="Tax ID" hint="Your business tax identification number.">
          <input
            type="text"
            value={form.tax_id || ''}
            onChange={(e) => update('tax_id', e.target.value)}
            placeholder="e.g. 123-45-6789"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
        <Field
          label="Default tax rate (%)"
          hint="Applied to customer orders by default. Simulated in this demo."
        >
          <input
            type="number"
            step="0.01"
            value={form.tax_rate ?? 0}
            onChange={(e) => update('tax_rate', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
          Tax filing, remittance, and jurisdictional calculations are <strong>simulated</strong> in this demo.
        </div>
      </div>
      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function FulfillmentSection({ form, update, save, saving }) {
  const value = form.default_fulfillment || 'FBM'
  return (
    <>
      <SectionHeader
        title="Fulfillment Settings"
        description="Default fulfillment method for new products."
      />
      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
        {['FBM', 'FBA'].map((m) => (
          <button
            key={m}
            onClick={() => update('default_fulfillment', m)}
            className={
              'text-left border-2 rounded-lg p-4 transition ' +
              (value === m
                ? 'border-[#c7511f] bg-orange-50'
                : 'border-gray-200 hover:border-gray-400')
            }
          >
            <div className="font-bold text-gray-900">
              {m === 'FBA' ? 'Fulfillment by Amazon (FBA)' : 'Fulfilled by Merchant (FBM)'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {m === 'FBA'
                ? 'Amazon stores, packs, and ships your products.'
                : 'You handle storage, packing, and shipping.'}
            </p>
          </button>
        ))}
      </div>
      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function PaymentsSection({ form, update, save, saving }) {
  return (
    <>
      <SectionHeader
        title="Payment Settings"
        description="Payout schedule and deposit account."
      />
      <div className="space-y-4 max-w-lg">
        <Field label="Payout schedule">
          <select
            value={form.payout_schedule || 'biweekly'}
            onChange={(e) => update('payout_schedule', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 14 days</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>

        <Field
          label="Bank account (last 4 digits)"
          hint="Full account numbers are never stored in this demo."
        >
          <input
            type="text"
            maxLength={4}
            value={form.bank_last4 || ''}
            onChange={(e) =>
              update('bank_last4', e.target.value.replace(/\D/g, ''))
            }
            placeholder="••••"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </Field>

        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
          All payouts and deposits are <strong>simulated</strong>. No real funds move.
        </div>
      </div>
      <SaveRow onClick={() => save()} saving={saving} />
    </>
  )
}

function PlanSection({ form, save, saving }) {
  const current = form.plan || 'individual'
  return (
    <>
      <SectionHeader
        title="Selling Plan"
        description="Choose the plan that fits your business."
      />
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
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
            features: ['Bulk listing', 'Advanced reports', 'Advertising', 'Automate Pricing', 'Advanced tools'],
          },
        ].map((p) => {
          const active = current === p.id
          return (
            <div
              key={p.id}
              className={
                'border-2 rounded-lg p-6 flex flex-col ' +
                (active ? 'border-[#c7511f] bg-orange-50' : 'border-gray-200')
              }
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{p.label}</h3>
                {active && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#c7511f] text-white">
                    CURRENT
                  </span>
                )}
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                <span className="text-gray-600 ml-2 text-sm">{p.unit}</span>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-700 mb-5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={active || saving}
                onClick={() => save({ plan: p.id })}
                className={
                  'font-medium py-2 rounded transition ' +
                  (active
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-[#febd69] hover:bg-[#f3a847] text-gray-900')
                }
              >
                {active ? 'Current plan' : 'Switch to ' + p.label}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}