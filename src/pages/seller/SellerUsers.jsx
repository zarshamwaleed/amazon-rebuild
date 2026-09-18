import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  ArrowLeft,
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
  active: { label: 'Active', cls: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  invited: { label: 'Invited', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  disabled: { label: 'Disabled', cls: 'bg-gray-100 text-gray-600', icon: AlertCircle },
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
    setEditDraft((d) => ({
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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/seller/settings"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back to settings"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
          <p className="text-sm text-gray-600">
            Invite team members and control what they can access.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Invite user
        </button>
      </div>

      {/* Role template info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <strong>Role templates:</strong> choosing a role applies a default
        permission set which you can then customize per user. Roles:{' '}
        <strong>Administrator</strong> · <strong>Manager</strong> ·{' '}
        <strong>Employee</strong> · <strong>Analyst</strong>.
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">
            Loading team…
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No team members yet
            </h3>
            <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
              Invite colleagues to help manage your store. Each user gets their
              own login with scoped permissions.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
            >
              <Plus className="w-4 h-4" /> Invite your first user
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status = STATUS_STYLES[u.status] || STATUS_STYLES.active
                  const StatusIcon = status.icon
                  const editing = editingId === u.id
                  return (
                    <>
                      <tr
                        key={u.id}
                        className={'border-t ' + (editing ? 'bg-orange-50/40' : 'hover:bg-gray-50')}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#232f3e] text-white flex items-center justify-center text-xs font-bold">
                              {(u.full_name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {u.full_name || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          {editing ? (
                            <select
                              value={editDraft.role}
                              onChange={(e) => setRole(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            >
                              <option>Administrator</option>
                              <option>Manager</option>
                              <option>Employee</option>
                              <option>Analyst</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-gray-900">
                              <Shield className="w-3.5 h-3.5 text-gray-500" />
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleStatus(u)}
                            className={
                              'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition hover:opacity-80 ' +
                              status.cls
                            }
                            title="Click to toggle status"
                          >
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {editing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveEdit(u)}
                                className="p-1.5 hover:bg-green-50 rounded"
                                title="Save"
                              >
                                <Save className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Cancel"
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(u)}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Edit permissions"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleRemove(u)}
                                className="p-1.5 hover:bg-red-50 rounded"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {editing && (
                        <tr key={u.id + '-edit'} className="bg-orange-50/40">
                          <td colSpan={5} className="px-5 py-4 border-t">
                            <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
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
                                      'text-left p-3 rounded border transition ' +
                                      (checked
                                        ? 'border-[#c7511f] bg-white'
                                        : 'border-gray-200 bg-white hover:border-gray-400')
                                    }
                                  >
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span
                                        className={
                                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ' +
                                          (checked
                                            ? 'bg-[#c7511f] border-[#c7511f]'
                                            : 'border-gray-300')
                                        }
                                      >
                                        {checked && (
                                          <CheckCircle2 className="w-3 h-3 text-white" />
                                        )}
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {p.label}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-6">
                                      {p.desc}
                                    </p>
                                  </button>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Invite team member</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ali Khan"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(ROLE_TEMPLATES).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleAndPerms(r)}
                  className={
                    'text-sm px-3 py-2 rounded border text-center transition ' +
                    (role === r
                      ? 'border-[#c7511f] bg-orange-50 text-[#c7511f] font-medium'
                      : 'border-gray-300 hover:border-gray-400')
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choosing a role applies its default permissions. You can customize
              them below.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERMISSION_KEYS.map((p) => {
                const checked = !!permissions[p.id]
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermission(p.id)}
                    className={
                      'text-left p-3 rounded border transition ' +
                      (checked
                        ? 'border-[#c7511f] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-400 bg-white')
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ' +
                          (checked
                            ? 'bg-[#c7511f] border-[#c7511f]'
                            : 'border-gray-300')
                        }
                      >
                        {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {p.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6 mt-0.5">{p.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

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