import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gift,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import CheckoutSteps from '../components/CheckoutSteps'
import {
  createRegistry,
  REGISTRY_TYPES,
  REGISTRY_TYPE_ICONS,
  getRegistryTypeMeta,
} from '../services/registryService'

const STEPS = [
  { id: 'type', label: 'Type', icon: Gift },
  { id: 'information', label: 'Information', icon: FileText },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'confirm', label: 'Confirm', icon: CheckCircle2 },
]

const textareaClass =
  'w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 ' +
  'placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 resize-none'

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

  function goToStep(index1Based) {
    // CheckoutSteps only allows navigating to already-completed steps
    setError(null)
    setStep(index1Based - 1)
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
    <div className="max-w-3xl mx-auto py-2 space-y-8">
      <Link
        to="/registry"
        className="text-body-sm text-charcoal-600 hover:text-charcoal-900 inline-flex items-center gap-1.5 transition-avenzo"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Registry
      </Link>

      <CheckoutSteps steps={STEPS} currentStep={step + 1} onStepClick={goToStep} />

      <Card padding="lg">
        {/* Step 0: Type */}
        {step === 0 && (
          <>
            <h1 className="heading-page mb-1">What type of registry?</h1>
            <p className="text-body-sm mb-6">
              Choose the occasion. You can change this later.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {REGISTRY_TYPES.map((t) => {
                const Icon = REGISTRY_TYPE_ICONS[t.id] || Gift
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update('type', t.id)}
                    className={
                      'text-left p-4 rounded-xl border-2 transition-avenzo flex items-start gap-3 ' +
                      (form.type === t.id
                        ? 'border-brass-500 bg-brass-50'
                        : 'border-stone-200 hover:border-stone-400')
                    }
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-brass-100 text-brass-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-charcoal-900">{t.name}</div>
                      <div className="text-caption mt-0.5">{t.tagline}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Step 1: Information */}
        {step === 1 && (
          <>
            <h1 className="heading-page mb-1">Registry information</h1>
            <p className="text-body-sm mb-6">
              Tell us about your registry so guests can find it.
            </p>
            <div className="space-y-4">
              <Input
                label="Registry name"
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={typeMeta.name}
              />

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
                  label="Partner / co-registrant name"
                  type="text"
                  value={form.co_registrant_name}
                  onChange={(e) => update('co_registrant_name', e.target.value)}
                  placeholder="e.g. Michael"
                />
              )}

              {form.type === 'baby' && (
                <Input
                  label="Expected arrival date"
                  type="date"
                  value={form.expected_date}
                  onChange={(e) => update('expected_date', e.target.value)}
                />
              )}

              {form.type !== 'baby' && (
                <Input
                  label="Event date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => update('event_date', e.target.value)}
                />
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="e.g. Austin"
                />
                <Input
                  label="State / Region"
                  type="text"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  placeholder="e.g. TX"
                />
              </div>

              <div>
                <label className="text-label block mb-1.5">
                  Short description (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="e.g. Help us prepare for our little one."
                  className={textareaClass}
                />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Privacy */}
        {step === 2 && (
          <>
            <h1 className="heading-page mb-1">Privacy settings</h1>
            <p className="text-body-sm mb-6">
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
                    type="button"
                    onClick={() => update('privacy', p.id)}
                    className={
                      'w-full text-left p-4 rounded-xl border-2 transition-avenzo flex items-start gap-3 ' +
                      (form.privacy === p.id
                        ? 'border-brass-500 bg-brass-50'
                        : 'border-stone-200 hover:border-stone-400')
                    }
                  >
                    <Icon className="w-5 h-5 text-charcoal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-charcoal-900">{p.label}</div>
                      <div className="text-caption mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="space-y-1 border-t border-stone-200 pt-4">
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
            <h1 className="heading-page mb-1">Review and confirm</h1>
            <p className="text-body-sm mb-6">
              You can change any of these later.
            </p>

            <div
              className={
                'relative rounded-xl p-6 overflow-hidden bg-gradient-to-br ' + typeMeta.color + ' mb-6'
              }
            >
              <div className="absolute inset-0 bg-charcoal-900/25" />
              <div className="relative text-white">
                {(() => {
                  const TypeIcon = REGISTRY_TYPE_ICONS[typeMeta.id] || Gift
                  return (
                    <span className="inline-flex w-10 h-10 rounded-lg bg-white/15 items-center justify-center mb-2">
                      <TypeIcon className="w-5 h-5" />
                    </span>
                  )
                })()}
                <div className="text-xs uppercase tracking-[0.15em] font-medium text-white/80">
                  {typeMeta.name}
                </div>
                <h2 className="font-display text-2xl font-medium mt-1">{form.name}</h2>
                {form.city && (
                  <div className="text-sm mt-2 flex items-center gap-1.5 text-white/90">
                    <MapPin className="w-3.5 h-3.5" /> {form.city}
                    {form.state ? ', ' + form.state : ''}
                  </div>
                )}
              </div>
            </div>

            <dl className="space-y-2 text-body-sm">
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
          <div className="mt-4 text-body-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button variant="secondary" onClick={next}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="secondary" onClick={submit} loading={saving}>
              {saving ? 'Creating…' : 'Create Registry'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-stone-200 pb-2 last:border-b-0">
      <dt className="text-charcoal-500">{label}</dt>
      <dd className="text-charcoal-900 capitalize font-medium">{value}</dd>
    </div>
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
