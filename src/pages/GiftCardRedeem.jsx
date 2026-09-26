import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gift,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { redeemGiftCardCode } from '../services/giftCardService'
import Button from '../components/Button'

export default function GiftCardRedeem() {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      pushToast('Please sign in to redeem a gift card', { type: 'error' })
      navigate('/login', { state: { from: '/gift-cards/redeem' } })
      return
    }

    const clean = code.trim()
    if (!clean) return

    setLoading(true)
    setResult(null)
    try {
      const r = await redeemGiftCardCode(clean)
      if (r.success) {
        setResult({
          type: 'success',
          amount: r.amount,
          newBalance: r.new_balance,
        })
        pushToast(`$${Number(r.amount).toFixed(2)} added to your balance`, {
          type: 'success',
        })
        setCode('')
      } else {
        setResult({ type: 'error', message: r.error || 'Could not redeem this code' })
      }
    } catch (err) {
      setResult({ type: 'error', message: err.message || 'Redeem failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <Link
        to="/gift-cards"
        className="text-sm text-charcoal-600 hover:text-brass-700 transition-avenzo flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gift Cards
      </Link>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-brass-900 text-bone-50 p-8 md:p-10 shadow-card ring-1 ring-inset ring-bone-50/10">
        <Gift className="w-9 h-9 text-brass-400 mb-3" strokeWidth={1.5} />
        <h1 className="font-display text-display-sm font-medium mb-2">Redeem a Gift Card</h1>
        <p className="text-stone-300">
          Enter your claim code to add the balance to your Amazon Rebuild account.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-bone-50 border border-stone-200 rounded-xl p-6 md:p-8 space-y-5"
      >
        <div>
          <label className="block text-label mb-2">Claim code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXXXX-XXXX"
            maxLength={20}
            autoFocus
            className="w-full rounded-lg border border-stone-300 bg-bone-50 px-4 py-3.5 text-lg font-mono tracking-[0.15em] text-center text-charcoal-900 placeholder:text-charcoal-300 transition-avenzo focus:outline-none focus:border-brass-400"
          />
          <p className="text-caption mt-2">
            Codes are case-insensitive. Don't share your code with anyone outside Amazon Rebuild.
          </p>
        </div>

        <Button type="submit" variant="secondary" size="lg" loading={loading} disabled={!code.trim()} className="w-full">
          {loading ? 'Redeeming…' : 'Redeem Gift Card'}
        </Button>

        {!user && (
          <div className="bg-warning-50 border border-warning-500/20 text-warning-700 rounded-lg p-4 text-sm">
            You need to{' '}
            <Link to="/login" className="font-medium underline">
              sign in
            </Link>{' '}
            before redeeming a gift card.
          </div>
        )}
      </form>

      {/* Result */}
      {result && result.type === 'success' && (
        <div className="bg-success-50 border border-success-500/20 rounded-xl p-6 text-center animate-fade-in-up">
          <CheckCircle2 className="w-12 h-12 text-success-700 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-success-700 mb-1">Gift card redeemed!</h2>
          <p className="font-mono text-3xl font-semibold text-success-700 mb-1">
            +${Number(result.amount).toFixed(2)}
          </p>
          <p className="text-sm text-charcoal-700 mb-5">
            New balance: <span className="font-mono font-medium">${Number(result.newBalance).toFixed(2)}</span>
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/gift-cards/balance">
              <Button variant="secondary">View balance</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline">Start shopping</Button>
            </Link>
          </div>
        </div>
      )}

      {result && result.type === 'error' && (
        <div className="bg-error-50 border border-error-500/20 rounded-xl p-6 flex items-start gap-3 animate-fade-in-up">
          <AlertCircle className="w-5 h-5 text-error-700 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-error-700 mb-1">Could not redeem</h2>
            <p className="text-sm text-charcoal-700">{result.message}</p>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: Sparkles,
            title: 'Instant',
            desc: 'Balance is added to your account right away.',
          },
          {
            icon: DollarSign,
            title: 'Applied automatically',
            desc: 'Balance is applied at checkout before your card.',
          },
          {
            icon: Gift,
            title: 'No expiry',
            desc: 'Your balance never expires.',
          },
        ].map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="bg-bone-50 border border-stone-200 rounded-xl p-5">
              <Icon className="w-5 h-5 text-brass-700 mb-2" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-charcoal-900 mb-1">{f.title}</h3>
              <p className="text-caption">{f.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
