import { Fragment, useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Trash2,
  X,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Save,
  Mail,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerUsers,
  inviteSellerUser,
  updateSellerUser,
  removeSellerUser,
  ROLE_TEMPLATES,
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const PERMISSION_KEYS = [
  { id: 'products', label: 'Products', desc: 'Create and edit listings' },
  { id: 'inventory', label: 'Inventory', desc: 'Manage stock levels' },
  { id: 'orders', label: 'Orders', desc: 'Process and ship orders' },
  { id: 'advertising', label: 'Advertising', desc: 'Create ad campaigns' },
  { id: 'reports', label: 'Reports', desc: 'View business reports' },
  { id: 'payments', label: 'Payments', desc: 'View payouts and finances' },
  { id: 'settings', label: 'Settings', desc: 'Change account settings' },
]

const STATUS_STYLES = {
  active: { label: 'Active', color: 'green', icon: CheckCircle2 },
  invited: { label: 'Invited', color: 'yellow', icon: Clock },
  disabled: { label: 'Disabled', color: 'gray', icon: AlertCircle },
}

const ROLE_BADGE_COLORS = {
  Administrator: 'blue',
  Manager: 'green',
  Employee: 'gray',
  Analyst: 'gray',
}

export default function SellerUsers() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const u = await getSellerUsers(user.id)
      setUsers(u)
    } catch {
      pushToast('Could not load team members', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  function startEdit(u) {
    setEditingId(u.id)
    setEditDraft({
      role: u.role,
      permissions: { ...ROLE_TEMPLATES[u.role], ...(u.permissions || {}) },
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft(null)
  }

  async function saveEdit(u) {
    try {
      await updateSellerUser(user.id, u.id, {
        role: editDraft.role,
        permissions: editDraft.permissions,
      })
      pushToast('Permissions updated', { type: 'success' })
      cancelEdit()
      load()
    } catch {
      pushToast('Could not save changes', { type: 'error' })
    }
  }

  function setRole(role) {
    setEditDraft(() => ({
      role,
      permissions: { ...ROLE_TEMPLATES[role] },
    }))
  }

  function togglePermission(key) {
    setEditDraft((d) => ({
      ...d,
      permissions: { ...d.permissions, [key]: !d.permissions[key] },
    }))
  }

  async function handleRemove(u) {
    if (!confirm('Remove ' + (u.full_name || u.email) + ' from your team?')) return
    try {
      await removeSellerUser(user.id, u.id)
      pushToast('Member removed', { type: 'info' })
      load()
    } catch {
      pushToast('Could not remove member', { type: 'error' })
    }
  }

  async function toggleStatus(u) {
    const next = u.status === 'disabled' ? 'active' : 'disabled'
    try {
      await updateSellerUser(user.id, u.id, { status: next })
      pushToast('Member ' + next, { type: 'info' })
      load()
    } catch {
      pushToast('Could not update status', { type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="User Permissions"
        description="Invite team members and control what they can access."
        backTo="/seller/settings"
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Invite user
          </Button>
        }
      />

      {/* Role template info */}
      <div className="bg-info-50 border border-info-500/25 rounded-xl p-4 text-sm text-info-700">
        <strong className="text-charcoal-800">Role templates:</strong> choosing a role applies a
        default permission set which you can then customize per user. Roles:{' '}
        <strong className="text-charcoal-800">Administrator</strong> ·{' '}
        <strong className="text-charcoal-800">Manager</strong> ·{' '}
        <strong className="text-charcoal-800">Employee</strong> ·{' '}
        <strong className="text-charcoal-800">Analyst</strong>.
      </div>

      {/* Table */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            message="Invite colleagues to help manage your store. Each user gets their own login with scoped permissions."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" /> Invite your first user
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">User</th>
                  <th className="text-label text-left px-4 py-3">Email</th>
                  <th className="text-label text-left px-4 py-3">Role</th>
                  <th className="text-label text-center px-4 py-3">Status</th>
                  <th className="text-label text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => {
                  const status = STATUS_STYLES[u.status] || STATUS_STYLES.active
                  const StatusIcon = status.icon
                  const editing = editingId === u.id
                  return (
                    <Fragment key={u.id}>
                      <tr
                        className={'transition-avenzo ' + (editing ? 'bg-brass-50/50' : 'hover:bg-stone-50/60')}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-charcoal-900 text-brass-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {(u.full_name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="font-medium text-charcoal-900">{u.full_name || '—'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-charcoal-600">{u.email}</td>
                        <td className="px-4 py-3.5">
                          {editing ? (
                            <select
                              value={editDraft.role}
                              onChange={(e) => setRole(e.target.value)}
                              className="border border-stone-300 bg-bone-50 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-brass-400 transition-avenzo"
                            >
                              <option>Administrator</option>
                              <option>Manager</option>
                              <option>Employee</option>
                              <option>Analyst</option>
                            </select>
                          ) : (
                            <Badge color={ROLE_BADGE_COLORS[u.role] || 'gray'}>
                              <Shield className="w-3 h-3" /> {u.role}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => toggleStatus(u)}
                            className="hover:opacity-80 transition-avenzo"
                            title="Click to toggle status"
                          >
                            <Badge color={status.color}>
                              <StatusIcon className="w-3 h-3" /> {status.label}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {editing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveEdit(u)}
                                className="p-1.5 hover:bg-success-50 rounded-lg transition-avenzo"
                                title="Save"
                              >
                                <Save className="w-4 h-4 text-success-500" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                                title="Cancel"
                              >
                                <X className="w-4 h-4 text-charcoal-400" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(u)}
                                className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                                title="Edit permissions"
                              >
                                <Edit className="w-4 h-4 text-charcoal-500" />
                              </button>
                              <button
                                onClick={() => handleRemove(u)}
                                className="p-1.5 hover:bg-error-50 rounded-lg transition-avenzo"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4 text-error-500" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {editing && (
                        <tr className="bg-brass-50/50">
                          <td colSpan={5} className="px-5 py-4 border-t border-stone-200">
                            <div className="text-label mb-2">
                              Permissions for {u.full_name || u.email}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {PERMISSION_KEYS.map((p) => {
                                const checked = !!editDraft.permissions[p.id]
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => togglePermission(p.id)}
                                    className={
                                      'text-left p-3 rounded-lg border transition-avenzo ' +
                                      (checked
                                        ? 'border-brass-400 bg-bone-50'
                                        : 'border-stone-200 bg-bone-50 hover:border-stone-300')
                                    }
                                  >
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span
                                        className={
                                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-avenzo ' +
                                          (checked ? 'bg-brass-500 border-brass-500' : 'border-stone-300')
                                        }
                                      >
                                        {checked && <CheckCircle2 className="w-3 h-3 text-bone-50" />}
                                      </span>
                                      <span className="text-sm font-medium text-charcoal-900">{p.label}</span>
                                    </div>
                                    <p className="text-xs text-charcoal-500 ml-6">{p.desc}</p>
                                  </button>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function AddUserModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Employee')
  const [permissions, setPermissions] = useState({ ...ROLE_TEMPLATES.Employee })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function setRoleAndPerms(newRole) {
    setRole(newRole)
    setPermissions({ ...ROLE_TEMPLATES[newRole] })
  }

  function togglePermission(key) {
    setPermissions((p) => ({ ...p, [key]: !p[key] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return setError('Email is required')
    if (!email.includes('@')) return setError('Enter a valid email')
    setSaving(true)
    setError(null)
    try {
      await inviteSellerUser(user.id, {
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        permissions,
      })
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
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted border border-stone-200 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub flex items-center gap-2">
            <Mail className="w-4 h-4 text-charcoal-400" /> Invite team member
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo" aria-label="Close">
            <X className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
            <Input
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ali Khan"
            />
          </div>

          <div>
            <label className="block text-label mb-2">Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(ROLE_TEMPLATES).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleAndPerms(r)}
                  className={
                    'text-sm px-3 py-2 rounded-lg border text-center transition-avenzo ' +
                    (role === r
                      ? 'border-brass-400 bg-brass-50 text-brass-700 font-medium'
                      : 'border-stone-300 hover:border-stone-400')
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-caption mt-2">
              Choosing a role applies its default permissions. You can customize them below.
            </p>
          </div>

          <div>
            <label className="block text-label mb-2">Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERMISSION_KEYS.map((p) => {
                const checked = !!permissions[p.id]
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermission(p.id)}
                    className={
                      'text-left p-3 rounded-lg border transition-avenzo ' +
                      (checked ? 'border-brass-400 bg-brass-50' : 'border-stone-200 hover:border-stone-300 bg-bone-50')
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-avenzo ' +
                          (checked ? 'bg-brass-500 border-brass-500' : 'border-stone-300')
                        }
                      >
                        {checked && <CheckCircle2 className="w-3 h-3 text-bone-50" />}
                      </span>
                      <span className="text-sm font-medium text-charcoal-900">{p.label}</span>
                    </div>
                    <p className="text-xs text-charcoal-500 ml-6 mt-0.5">{p.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/25 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Sending…' : 'Send invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
