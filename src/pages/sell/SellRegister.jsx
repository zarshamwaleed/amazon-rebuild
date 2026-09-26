import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createSellerProfile, getSellerProfile } from '../../services/sellerService'
import Button from '../../components/Button'

const STEPS = [
  'Business',
  'Seller',
  'Billing',
  'Store',
  'Verify',
]

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'private', label: 'Privately owned business' },
  { value: 'public', label: 'Publicly listed business' },
]

const CATEGORIES = [
  'Electronics',
  'Home & Kitchen',
  'Books',
  'Fashion',
  'Sports & Outdoors',
  'Toys & Games',
  'Beauty',
  'Grocery',
  'Other',
]

export default function SellRegister() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { pushToast } = useToast()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    // Step 1
    business_location: '',
    business_type: 'individual',
    business_name: '',
    business_reg_number: '',
    business_address: '',
    business_phone: '',
    // Step 2
    full_name: '',
    date_of_birth: '',
    residential_address: '',
    seller_phone: '',
    // Step 3
    payment_method: 'demo_card',
    demo_bank_name: '',
    demo_account_last4: '',
    // Step 4
    store_name: '',
    product_categories: [],
    has_product_codes: false,
    is_manufacturer: false,
    is_brand_owner: false,
    // Meta
    plan: params.get('plan') || 'individual',
    verified: false,
  })

  // If already a seller, send to /seller
  useEffect(() => {
    if (authLoading || !user) return
    getSellerProfile(user.id)
      .then((existing) => {
        if (existing?.verified) navigate('/seller', { replace: true })
      })
      .catch(() => {})
  }, [user, authLoading, navigate])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleCategory(cat) {
    setForm((f) => ({
      ...f,
      product_categories: f.product_categories.includes(cat)
        ? f.product_categories.filter((c) => c !== cat)
        : [...f.product_categories, cat],
    }))
  }

  function validateStep() {
    setError(null)
    if (step === 1) {
      if (!form.business_location.trim()) return 'Business location is required'
      if (!form.business_name.trim()) return 'Business name is required'
      if (!form.business_address.trim()) return 'Business address is required'
      if (!form.business_phone.trim()) return 'Phone number is required'
    }
    if (step === 2) {
      if (!form.full_name.trim()) return 'Full name is required'
      if (!form.date_of_birth.trim()) return 'Date of birth is required'
      if (!form.residential_address.trim()) return 'Residential address is required'
      if (!form.seller_phone.trim()) return 'Phone is required'
    }
    if (step === 3) {
      if (!form.demo_bank_name.trim()) return 'Demo bank name is required'
      if (!form.demo_account_last4.trim() || form.demo_account_last4.length < 4)
        return 'Enter last 4 digits of the demo account'
    }
    if (step === 4) {
      if (!form.store_name.trim()) return 'Store name is required'
      if (form.product_categories.length === 0) return 'Pick at least one category'
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) return setError(err)
    if (step < 5) setStep(step + 1)
  }

  function back() {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  async function completeVerification() {
    if (!user) {
      pushToast('Please sign in to register as a seller', { type: 'error' })
      navigate('/login', { state: { from: '/sell/register' } })
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createSellerProfile(user.id, { ...form, verified: true })
      pushToast('Seller account created!', { type: 'success' })
      navigate('/seller', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not complete registration')
    } finally {
      setSaving(false)
    }
  }

  // Signed-out gate
  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="heading-page mb-3">Sign in to register</h1>
        <p className="text-av-body text-charcoal-600 mb-6">
          You need an Avenzo account before registering as a seller.
        </p>
        <Link to="/login" state={{ from: '/sell/register' }}>
          <Button size="lg">Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-10 md:py-14">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = n < step
            const active = n === step
            return (
              <div key={label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-avenzo ' +
                      (done
                        ? 'bg-success-500 border-success-500 text-bone-50'
                        : active
                        ? 'bg-brass-400 border-brass-400 text-charcoal-900'
                        : 'bg-bone-50 border-stone-300 text-charcoal-400')
                    }
                  >
                    {done ? <Check className="w-4 h-4" /> : n}
                  </div>
                  <span
                    className={
                      'text-av-caption mt-1 hidden sm:block ' +
                      (active ? 'font-bold text-charcoal-900' : 'text-charcoal-400')
                    }
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={
                      'h-0.5 flex-1 mx-1 ' + (done ? 'bg-success-500' : 'bg-stone-200')
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-av-caption text-charcoal-400 text-center mt-2">
          Step {step} of {STEPS.length}
        </p>
      </div>

      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-6 md:p-8">
        {/* Step 1 */}
        {step === 1 && (
          <>
            <h1 className="heading-page mb-1">Business information</h1>
            <p className="text-av-body-sm text-charcoal-600 mb-6">
              Tell us about your business. This information is simulated for the demo.
            </p>
            <div className="space-y-4">
              <Field label="Where is your business located?">
                <input
                  type="text"
                  value={form.business_location}
                  onChange={(e) => update('business_location', e.target.value)}
                  placeholder="Pakistan"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <Field label="Business type">
                <div className="space-y-2">
                  {BUSINESS_TYPES.map((b) => (
                    <label key={b.value} className="flex items-center gap-2 text-av-body-sm text-charcoal-800 cursor-pointer">
                      <input
                        type="radio"
                        name="business_type"
                        value={b.value}
                        checked={form.business_type === b.value}
                        onChange={() => update('business_type', b.value)}
                        className="accent-charcoal-900"
                      />
                      {b.label}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Business name">
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => update('business_name', e.target.value)}
                  placeholder="Zarsham Enterprises"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <Field label="Business registration number (optional)">
                <input
                  type="text"
                  value={form.business_reg_number}
                  onChange={(e) => update('business_reg_number', e.target.value)}
                  placeholder="e.g. 1234567"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <Field label="Business address">
                <input
                  type="text"
                  value={form.business_address}
                  onChange={(e) => update('business_address', e.target.value)}
                  placeholder="Street, city, postal code"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <Field label="Phone number">
                <input
                  type="text"
                  value={form.business_phone}
                  onChange={(e) => update('business_phone', e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <h1 className="heading-page mb-1">Seller information</h1>
            <p className="text-av-body-sm text-charcoal-600 mb-6">
              Details about the person responsible for this seller account.
            </p>
            <div className="space-y-4">
              <Field label="Full name">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="Zarsham Waleed"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>
              <Field label="Date of birth">
                <input
                  type="text"
                  value={form.date_of_birth}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>
              <Field label="Residential address">
                <input
                  type="text"
                  value={form.residential_address}
                  onChange={(e) => update('residential_address', e.target.value)}
                  placeholder="Street, city, postal code"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="text"
                  value={form.seller_phone}
                  onChange={(e) => update('seller_phone', e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <h1 className="heading-page mb-1">Billing information</h1>
            <p className="text-av-body-sm text-charcoal-600 mb-6">
              For the demo, use simulated billing information. Do not enter real card details.
            </p>
            <div className="space-y-4">
              <Field label="Payment method">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-av-body-sm text-charcoal-800">
                    <input
                      type="radio"
                      name="payment_method"
                      value="demo_card"
                      checked={form.payment_method === 'demo_card'}
                      onChange={() => update('payment_method', 'demo_card')}
                      className="accent-charcoal-900"
                    />
                    Demo Credit / Debit Card
                  </label>
                  <label className="flex items-center gap-2 text-av-body-sm text-charcoal-800">
                    <input
                      type="radio"
                      name="payment_method"
                      value="demo_bank"
                      checked={form.payment_method === 'demo_bank'}
                      onChange={() => update('payment_method', 'demo_bank')}
                      className="accent-charcoal-900"
                    />
                    Demo Bank Account
                  </label>
                </div>
              </Field>

              <Field label="Demo bank name">
                <input
                  type="text"
                  value={form.demo_bank_name}
                  onChange={(e) => update('demo_bank_name', e.target.value)}
                  placeholder="Demo Bank"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <Field label="Demo account last 4 digits">
                <input
                  type="text"
                  maxLength={4}
                  value={form.demo_account_last4}
                  onChange={(e) =>
                    update('demo_account_last4', e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="1234"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <div className="text-av-caption text-charcoal-500 bg-stone-50 border border-stone-200 rounded-lg p-3">
                All billing data is simulated. No real charges or verification.
              </div>
            </div>
          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <>
            <h1 className="heading-page mb-1">Your store</h1>
            <p className="text-av-body-sm text-charcoal-600 mb-6">
              Choose your store name and the categories you'll sell in.
            </p>
            <div className="space-y-4">
              <Field label="Store name">
                <input
                  type="text"
                  value={form.store_name}
                  onChange={(e) => update('store_name', e.target.value)}
                  placeholder="Zarsham Store"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-av-body-sm bg-bone-50 focus:outline-none focus:border-brass-400 focus:shadow-focus-ring transition-avenzo"
                />
              </Field>

              <Field label="What products do you want to sell?">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => {
                    const active = form.product_categories.includes(c)
                    return (
                      <label
                        key={c}
                        className={
                          'flex items-center gap-2 text-av-body-sm px-3 py-2 rounded-lg border cursor-pointer transition-avenzo ' +
                          (active
                            ? 'border-brass-400 bg-brass-50'
                            : 'border-stone-300 hover:border-stone-400')
                        }
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleCategory(c)}
                          className="accent-charcoal-900"
                        />
                        {c}
                      </label>
                    )
                  })}
                </div>
              </Field>

              <div className="space-y-2 pt-2">
                <CheckRow
                  label="Do your products have product codes (UPC / EAN)?"
                  value={form.has_product_codes}
                  onChange={(v) => update('has_product_codes', v)}
                />
                <CheckRow
                  label="Are you the manufacturer?"
                  value={form.is_manufacturer}
                  onChange={(v) => update('is_manufacturer', v)}
                />
                <CheckRow
                  label="Are you the brand owner?"
                  value={form.is_brand_owner}
                  onChange={(v) => update('is_brand_owner', v)}
                />
              </div>
            </div>
          </>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <>
            <h1 className="heading-page mb-1">Verify your account</h1>
            <p className="text-av-body-sm text-charcoal-600 mb-6">
              Review your details. Verification is simulated for the demo.
            </p>

            <div className="space-y-3 mb-6">
              <VerifyRow label="Business information" detail={form.business_name} />
              <VerifyRow label="Seller information" detail={form.full_name} />
              <VerifyRow
                label="Billing information"
                detail={`Demo ${form.payment_method === 'demo_card' ? 'card' : 'bank'} · •••• ${form.demo_account_last4}`}
              />
              <VerifyRow label="Store information" detail={form.store_name} />
            </div>

            <div className="bg-success-50 border border-success-500/30 rounded-lg p-4 mb-6">
              <p className="text-av-body-sm text-success-700 font-medium">
                Demo verification will complete instantly.
              </p>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 text-av-body-sm text-error-700 bg-error-50 border border-error-500/30 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
          <button
            onClick={back}
            disabled={step === 1}
            className={
              'flex items-center gap-1 text-av-body-sm font-medium transition-avenzo ' +
              (step === 1 ? 'text-stone-300 cursor-not-allowed' : 'text-charcoal-700 hover:text-charcoal-900')
            }
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < 5 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={completeVerification} loading={saving}>
              {saving ? 'Verifying…' : 'Complete verification & enter Seller Central'}
            </Button>
          )}
        </div>
      </div>

      <div className="text-center mt-6 text-av-caption text-charcoal-400">
        <Link to="/sell" className="hover:text-charcoal-700 hover:underline transition-avenzo">
          &larr; Back to Sell landing
        </Link>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-av-label text-charcoal-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function CheckRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-200 last:border-b-0">
      <span className="text-av-body-sm text-charcoal-800">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={
            'text-av-caption px-3 py-1.5 rounded-lg border transition-avenzo ' +
            (value
              ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
              : 'bg-bone-50 border-stone-300 hover:border-stone-400')
          }
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={
            'text-av-caption px-3 py-1.5 rounded-lg border transition-avenzo ' +
            (!value
              ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
              : 'bg-bone-50 border-stone-300 hover:border-stone-400')
          }
        >
          No
        </button>
      </div>
    </div>
  )
}

function VerifyRow({ label, detail }) {
  return (
    <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-lg p-3">
      <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-av-body-sm font-medium text-charcoal-900">{label}</div>
        {detail && <div className="text-av-caption text-charcoal-500">{detail}</div>}
      </div>
    </div>
  )
}
