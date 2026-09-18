import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  X,
  MapPin,
  Shield,
  User,
  Calendar,
  Gift,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getRegistryById,
  updateRegistry,
  deleteRegistry,
  REGISTRY_TYPES,
} from '../services/registryService'

export default function EditRegistry() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    let cancelled = false
    async function load() {
      try {
        const r = await getRegistryById(id)
        if (!r) {
          setError('Registry not found')
          return
        }
        if (r.user_id !== user.id) {
          setError('You do not have permission to edit this registry')
          return
        }
        if (!cancelled) {
          setForm({
            type: r.type,
            name: r.name || '',
            description: r.description || '',
            owner_first_name: r.owner_first_name || '',
            owner_last_name: r.owner_last_name || '',
            co_registrant_name: r.co_registrant_name || '',
            event_date: r.event_date || '',
            expected_date: r.expected_date || '',
            city: r.city || '',
            state: r.state || '',
            privacy: r.privacy || 'public',
            allow_name_search: r.allow_name_search !== false,
            show_location: r.show_location !== false,
            gift_address: r.gift_address || '',
          })
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return setError('Registry name is required')
    if (!form.owner_first_name.trim()) return setError('First name is required')

    setSaving(true)
    setError(null)
    try {
      await updateRegistry(id, {
        type: form.type,
        name: form.name,
        description: form.description,
        owner_first_name: form.owner_first_name,
        owner_last_name: form.owner_last_name,
        co_registrant_name: form.co_registrant_name,
        event_date: form.event_date || null,
        expected_date: form.expected_date || null,
        city: form.city,
        state: form.state,
        privacy: form.privacy,
        allow_name_search: form.allow_name_search,
        show_location: form.show_location,
        gift_address: form.gift_address,
      })
      pushToast('Registry updated', { type: 'success' })
      navigate(`/registry/${id}`)
    } catch (err) {
      setError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteRegistry(id)
      pushToast('Registry deleted', { type: 'info' })
      navigate('/registry/manage')
    } catch {
      pushToast('Could not delete', { type: 'error' })
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-600">Loading…</div>
  }

  if (error && !form) {
    return (
      <div className="max-w-lg mx-auto py-20">
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <h3 className="font-semibold text-gray-900 mb-1">{error}</h3>
          <Link
            to="/registry/manage"
            className="text-[#007185] hover:underline text-sm mt-3 inline-block"
          >
            ← Back to Manage Registries
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/registry/${id}`}
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Edit Registry</h1>
          <p className="text-sm text-gray-600">
            Update your registry details, privacy, and preferences.
          </p>
        </div>
      </div>

      {/* Basic info */}
      <Section title="Basic Information" icon={Gift}>
        <Field label="Registry name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Registry type">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGISTRY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update('type', t.id)}
                className={
                  'py-2.5 rounded border text-sm flex flex-col items-center gap-1 ' +
                  (form.type === t.id
                    ? 'border-[#c7511f] bg-orange-50 font-medium'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                <span className="text-xl">{t.emoji}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="input resize-none"
          />
        </Field>
      </Section>

      {/* Owner */}
      <Section title="Owner Information" icon={User}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="First name">
            <input
              type="text"
              value={form.owner_first_name}
              onChange={(e) => update('owner_first_name', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Last name">
            <input
              type="text"
              value={form.owner_last_name}
              onChange={(e) => update('owner_last_name', e.target.value)}
              className="input"
            />
          </Field>
        </div>

        {form.type === 'wedding' && (
          <Field label="Partner / co-registrant">
            <input
              type="text"
              value={form.co_registrant_name}
              onChange={(e) => update('co_registrant_name', e.target.value)}
              className="input"
            />
          </Field>
        )}

        <div className="grid md:grid-cols-2 gap-4">
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
        </div>
      </Section>

      {/* Date */}
      <Section title="Event Date" icon={Calendar}>
        {form.type === 'baby' ? (
          <Field label="Expected arrival date">
            <input
              type="date"
              value={form.expected_date}
              onChange={(e) => update('expected_date', e.target.value)}
              className="input max-w-xs"
            />
          </Field>
        ) : (
          <Field label="Event date">
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => update('event_date', e.target.value)}
              className="input max-w-xs"
            />
          </Field>
        )}
      </Section>

      {/* Gift address */}
      <Section title="Gift Address" icon={MapPin}>
        <Field label="Where should gifts be delivered?">
          <textarea
            rows={3}
            value={form.gift_address}
            onChange={(e) => update('gift_address', e.target.value)}
            placeholder="Full name, street, city, state, ZIP"
            className="input resize-none"
          />
        </Field>
      </Section>

      {/* Privacy */}
      <Section title="Privacy" icon={Shield}>
        <div className="space-y-2 mb-4">
          {[
            {
              id: 'public',
              label: 'Public',
              desc: 'Anyone can search for and view your registry.',
            },
            {
              id: 'shared',
              label: 'Shared',
              desc: 'Only people with the registry link can access it.',
            },
            {
              id: 'private',
              label: 'Private',
              desc: 'Only you can access it.',
            },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update('privacy', p.id)}
              className={
                'w-full text-left p-3 rounded border flex items-start gap-3 ' +
                (form.privacy === p.id
                  ? 'border-[#c7511f] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-400')
              }
            >
              <span
                className={
                  'w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' +
                  (form.privacy === p.id ? 'border-[#c7511f]' : 'border-gray-300')
                }
              >
                {form.privacy === p.id && (
                  <span className="w-2 h-2 rounded-full bg-[#c7511f]" />
                )}
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900">{p.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-1 border-t pt-4">
          <Toggle
            label="Allow search by name"
            value={form.allow_name_search}
            onChange={(v) => update('allow_name_search', v)}
          />
          <Toggle
            label="Show my location"
            value={form.show_location}
            onChange={(v) => update('show_location', v)}
          />
        </div>
      </Section>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-sm text-red-700 hover:text-red-800 hover:underline"
        >
          Delete this registry
        </button>
        <div className="flex gap-3">
          <Link
            to={`/registry/${id}`}
            className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2 rounded flex items-center gap-2 disabled:opacity-60 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 mb-2">Delete registry?</h2>
            <p className="text-sm text-gray-600 mb-5">
              This will permanently delete <strong>{form.name}</strong> and all
              its items. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500 text-white font-medium px-5 py-2 rounded text-sm"
              >
                Delete registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 pb-2 border-b flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {title}
      </h2>
      {children}
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

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-gray-800">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={
          'relative inline-flex h-6 w-11 rounded-full transition-colors ' +
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