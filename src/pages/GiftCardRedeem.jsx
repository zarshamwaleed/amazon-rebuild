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
        className="text-sm text-[#007185] hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gift Cards
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white rounded-lg p-8 md:p-10">
        <Gift className="w-10 h-10 text-[#febd69] mb-3" />
        <h1 className="text-3xl font-bold mb-2">Redeem a Gift Card</h1>
        <p className="text-gray-200">
          Enter your claim code to add the balance to your Amazon Rebuild account.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Claim code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXXXX-XXXX"
            maxLength={20}
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-[#febd69]"
          />
          <p className="text-xs text-gray-500 mt-2">
            Codes are case-insensitive. Don't share your code with anyone
            outside Amazon Rebuild.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold py-3 rounded-lg disabled:opacity-60 transition"
        >
          {loading ? 'Redeeming…' : 'Redeem Gift Card'}
        </button>

        {!user && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm">
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-900 mb-1">
            Gift card redeemed!
          </h2>
          <p className="text-3xl font-bold text-green-700 mb-1">
            +${Number(result.amount).toFixed(2)}
          </p>
          <p className="text-sm text-green-800 mb-5">
            New balance: ${Number(result.newBalance).toFixed(2)}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/gift-cards/balance"
              className="bg-green-600 hover:bg-green-500 text-white font-medium px-5 py-2.5 rounded"
            >
              View balance
            </Link>
            <Link
              to="/products"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-medium px-5 py-2.5 rounded"
            >
              Start shopping
            </Link>
          </div>
        </div>
      )}

      {result && result.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-900 mb-1">Could not redeem</h2>
            <p className="text-sm text-red-800">{result.message}</p>
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
            <div key={f.title} className="bg-white border border-gray-200 rounded-lg p-5">
              <Icon className="w-6 h-6 text-[#c7511f] mb-2" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-600">{f.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}