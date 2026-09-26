import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  MapPin,
  Shield,
  User,
  Calendar,
  Gift,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import {
  getRegistryById,
  updateRegistry,
  deleteRegistry,
  REGISTRY_TYPES,
  REGISTRY_TYPE_ICONS,
} from '../services/registryService'

const textareaClass =
  'w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 ' +
  'placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 resize-none'

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
    return (
      <div className="max-w-3xl mx-auto py-2 space-y-5 animate-fade-in">
        <div className="skeleton-shimmer h-8 w-56 rounded" />
        <div className="skeleton-shimmer h-40 rounded-xl" />
        <div className="skeleton-shimmer h-40 rounded-xl" />
        <div className="skeleton-shimmer h-28 rounded-xl" />
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <EmptyState
          icon={AlertCircle}
          title={error}
          action={
            <Link to="/registry/manage">
              <Button variant="outline">Back to Manage Registries</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/registry/${id}`}
          className="p-2 rounded-lg border border-stone-200 bg-bone-50 hover:bg-stone-100 transition-avenzo"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-charcoal-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="heading-page">Edit Registry</h1>
          <p className="text-body-sm">
            Update your registry details, privacy, and preferences.
          </p>
        </div>
      </div>

      {/* Basic info */}
      <Section title="Basic Information" icon={Gift}>
        <Input
          label="Registry name"
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />

        <div>
          <label className="text-label block mb-2">Registry type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGISTRY_TYPES.map((t) => {
              const Icon = REGISTRY_TYPE_ICONS[t.id] || Gift
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update('type', t.id)}
                  className={
                    'py-2.5 rounded-lg border text-sm flex flex-col items-center gap-1 transition-avenzo ' +
                    (form.type === t.id
                      ? 'border-brass-500 bg-brass-50 font-medium text-charcoal-900'
                      : 'border-stone-300 text-charcoal-700 hover:border-stone-400')
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{t.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-label block mb-1.5">Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={textareaClass}
          />
        </div>
      </Section>

      {/* Owner */}
      <Section title="Owner Information" icon={User}>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="First name"
            type="text"
            value={form.owner_first_name}
            onChange={(e) => update('owner_first_name', e.target.value)}
          />
          <Input
            label="Last name"
            type="text"
            value={form.owner_last_name}
            onChange={(e) => update('owner_last_name', e.target.value)}
          />
        </div>

        {form.type === 'wedding' && (
          <Input
            label="Partner / co-registrant"
            type="text"
            value={form.co_registrant_name}
            onChange={(e) => update('co_registrant_name', e.target.value)}
          />
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="City"
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <Input
            label="State / Region"
            type="text"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
          />
        </div>
      </Section>

      {/* Date */}
      <Section title="Event Date" icon={Calendar}>
        {form.type === 'baby' ? (
          <Input
            label="Expected arrival date"
            type="date"
            value={form.expected_date}
            onChange={(e) => update('expected_date', e.target.value)}
            className="max-w-xs"
          />
        ) : (
          <Input
            label="Event date"
            type="date"
            value={form.event_date}
            onChange={(e) => update('event_date', e.target.value)}
            className="max-w-xs"
          />
        )}
      </Section>

      {/* Gift address */}
      <Section title="Gift Address" icon={MapPin}>
        <div>
          <label className="text-label block mb-1.5">
            Where should gifts be delivered?
          </label>
          <textarea
            rows={3}
            value={form.gift_address}
            onChange={(e) => update('gift_address', e.target.value)}
            placeholder="Full name, street, city, state, ZIP"
            className={textareaClass}
          />
        </div>
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
                'w-full text-left p-3 rounded-lg border flex items-start gap-3 transition-avenzo ' +
                (form.privacy === p.id
                  ? 'border-brass-500 bg-brass-50'
                  : 'border-stone-200 hover:border-stone-400')
              }
            >
              <span
                className={
                  'w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' +
                  (form.privacy === p.id ? 'border-brass-500' : 'border-stone-300')
                }
              >
                {form.privacy === p.id && (
                  <span className="w-2 h-2 rounded-full bg-brass-500" />
                )}
              </span>
              <div>
                <div className="text-body-sm font-medium text-charcoal-900">{p.label}</div>
                <div className="text-caption mt-0.5">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-1 border-t border-stone-200 pt-4">
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
        <div className="text-body-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-body-sm text-error-700 hover:text-error-700/80 hover:underline transition-avenzo"
        >
          Delete this registry
        </button>
        <div className="flex gap-3">
          <Link to={`/registry/${id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="secondary" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-900/50 animate-fade-in"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md p-6 animate-scale-in">
            <h2 className="heading-sub mb-2">Delete registry?</h2>
            <p className="text-body-sm mb-5">
              This will permanently delete <strong className="text-charcoal-900">{form.name}</strong> and all
              its items. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete registry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-charcoal-500" />}
          {title}
        </span>
      }
    >
      <div className="space-y-4">{children}</div>
    </Card>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-body-sm">{label}</span>
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
            'absolute top-0.5 left-0.5 w-5 h-5 bg-bone-50 rounded-full shadow-subtle transition-avenzo ' +
            (value ? 'translate-x-5' : '')
          }
        />
      </button>
    </div>
  )
}
