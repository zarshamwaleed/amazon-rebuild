import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  createRegistry,
  REGISTRY_TYPES,
  getRegistryTypeMeta,
} from '../services/registryService'

const STEPS = ['Type', 'Information', 'Privacy', 'Confirm']

export default function CreateRegistry() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, profile } = useAuth()
  const { pushToast } = useToast()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    type: params.get('type') || 'baby',
    name: '',
    owner_first_name: '',
    owner_last_name: '',
    co_registrant_name: '',
    event_date: '',
    expected_date: '',
    city: '',
    state: '',
    description: '',
    privacy: 'public',
    allow_name_search: true,
    show_location: true,
  })

  // Prefill from user profile
  useEffect(() => {
    if (!profile) return
    setForm((f) => ({
      ...f,
      owner_first_name: f.owner_first_name || profile.full_name?.split(' ')[0] || '',
      owner_last_name:
        f.owner_last_name || profile.full_name?.split(' ').slice(1).join(' ') || '',
    }))
  }, [profile])

  // Auto-generate name from type + owner
  useEffect(() => {
    if (form.name) return
    if (!form.owner_first_name) return
    const typeLabel = getRegistryTypeMeta(form.type).name
    const generated = `${form.owner_first_name}'s ${typeLabel}`
    setForm((f) => ({ ...f, name: generated }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type, form.owner_first_name])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validateStep() {
    setError(null)
    if (step === 0) {
      if (!form.type) return 'Please choose a registry type.'
    }
    if (step === 1) {
      if (!form.name.trim()) return 'Registry name is required.'
      if (!form.owner_first_name.trim()) return 'Your first name is required.'
    }
    if (step === 2) {
      // privacy always set
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) return setError(err)
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  function back() {
    setError(null)
    if (step > 0) setStep(step - 1)
  }

  async function submit() {
    if (!user) {
      pushToast('Please sign in to create a registry.', { type: 'error' })
      navigate('/login')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await createRegistry(user.id, form)
      pushToast('Registry created!', { type: 'success' })
      navigate(`/registry/${created.id}`, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create registry')
    } finally {
      setSaving(false)
    }
  }

  const typeMeta = getRegistryTypeMeta(form.type)

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Breadcrumb */}
      <Link
        to="/registry"
        className="text-sm text-[#007185] hover:underline flex items-center gap-1 mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Registry
      </Link>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => {
            const done = i < step
            const active = i === step
            return (
              <div key={label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ' +
                      (done
                        ? 'bg-green-600 border-green-600 text-white'
                        : active
                        ? 'bg-[#febd69] border-[#febd69] text-gray-900'
                        : 'bg-white border-gray-300 text-gray-500')
                    }
                  >
                    {done ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={
                      'text-xs mt-1 hidden sm:block ' +
                      (active ? 'font-bold text-gray-900' : 'text-gray-500')
                    }
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={
                      'h-0.5 flex-1 mx-1 ' + (done ? 'bg-green-600' : 'bg-gray-200')
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        {/* Step 0: Type */}
        {step === 0 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              What type of registry?
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Choose the occasion. You can change this later.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {REGISTRY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update('type', t.id)}
                  className={
                    'text-left p-4 rounded-lg border-2 transition flex items-start gap-3 ' +
                    (form.type === t.id
                      ? 'border-[#c7511f] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-400')
                  }
                >
                  <span className="text-3xl flex-shrink-0">{t.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{t.tagline}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Information */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Registry information
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Tell us about your registry so guests can find it.
            </p>
            <div className="space-y-4">
              <Field label="Registry name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={typeMeta.name}
                  className="input"
                />
              </Field>

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

              {(form.type === 'wedding') && (
                <Field label="Partner / co-registrant name">
                  <input
                    type="text"
                    value={form.co_registrant_name}
                    onChange={(e) => update('co_registrant_name', e.target.value)}
                    placeholder="e.g. Michael"
                    className="input"
                  />
                </Field>
              )}

              {form.type === 'baby' && (
                <Field label="Expected arrival date">
                  <input
                    type="date"
                    value={form.expected_date}
                    onChange={(e) => update('expected_date', e.target.value)}
                    className="input"
                  />
                </Field>
              )}

              {form.type !== 'baby' && (
                <Field label="Event date">
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => update('event_date', e.target.value)}
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
                    placeholder="e.g. Austin"
                    className="input"
                  />
                </Field>
                <Field label="State / Region">
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    placeholder="e.g. TX"
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Short description (optional)">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="e.g. Help us prepare for our little one."
                  className="input resize-none"
                />
              </Field>
            </div>
          </>
        )}

        {/* Step 2: Privacy */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Privacy settings
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Control who can find and view your registry.
            </p>

            <div className="space-y-3 mb-6">
              {[
                {
                  id: 'public',
                  icon: Sparkles,
                  label: 'Public',
                  desc: 'Anyone can search for it.',
                },
                {
                  id: 'shared',
                  icon: Gift,
                  label: 'Shared',
                  desc: 'Only people with the registry link can access it.',
                },
                {
                  id: 'private',
                  icon: Shield,
                  label: 'Private',
                  desc: 'Only you can access it.',
                },
              ].map((p) => {
                const Icon = p.icon
                return (
                  <button
                    key={p.id}
                    onClick={() => update('privacy', p.id)}
                    className={
                      'w-full text-left p-4 rounded-lg border-2 transition flex items-start gap-3 ' +
                      (form.privacy === p.id
                        ? 'border-[#c7511f] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-400')
                    }
                  >
                    <Icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">{p.label}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="space-y-1 border-t pt-4">
              <Toggle
                label="Allow search by name"
                value={form.allow_name_search}
                onChange={(v) => update('allow_name_search', v)}
              />
              <Toggle
                label="Show my city / state"
                value={form.show_location}
                onChange={(v) => update('show_location', v)}
              />
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Review and confirm
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              You can change any of these later.
            </p>

            <div
              className={
                'rounded-lg p-6 bg-gradient-to-br ' + typeMeta.color + ' text-white mb-6'
              }
            >
              <div className="text-3xl mb-2">{typeMeta.emoji}</div>
              <div className="text-xs uppercase tracking-wider text-white/80">
                {typeMeta.name}
              </div>
              <h2 className="text-2xl font-bold mt-1">{form.name}</h2>
              {form.city && (
                <div className="text-sm mt-2 flex items-center gap-1 text-white/90">
                  <MapPin className="w-3 h-3" /> {form.city}
                  {form.state ? ', ' + form.state : ''}
                </div>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              <Row
                label="Owner"
                value={`${form.owner_first_name} ${form.owner_last_name}`.trim()}
              />
              {form.co_registrant_name && (
                <Row label="Co-registrant" value={form.co_registrant_name} />
              )}
              {form.expected_date && (
                <Row
                  label="Expected date"
                  value={new Date(form.expected_date).toLocaleDateString()}
                />
              )}
              {form.event_date && (
                <Row
                  label="Event date"
                  value={new Date(form.event_date).toLocaleDateString()}
                />
              )}
              <Row label="Privacy" value={form.privacy} />
              {form.description && <Row label="Description" value={form.description} />}
            </dl>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <button
            onClick={back}
            disabled={step === 0}
            className={
              'flex items-center gap-1 text-sm font-medium ' +
              (step === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900')
            }
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded flex items-center gap-2 transition"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={saving}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded transition disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Registry'}
            </button>
          )}
        </div>
      </div>
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-b-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 capitalize">{value}</dd>
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