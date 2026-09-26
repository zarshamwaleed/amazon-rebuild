import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Gift,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserGiftCardBalance } from '../services/giftCardService'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

export default function GiftCardBalance() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const b = await getUserGiftCardBalance(user.id)
      setBalance(b)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <EmptyState
          icon={Gift}
          title="Sign in to view your balance"
          message="Your gift card balance is tied to your Amazon Rebuild account."
          action={
            <Link to="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <Link
        to="/gift-cards"
        className="text-sm text-charcoal-600 hover:text-brass-700 transition-avenzo flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gift Cards
      </Link>

      <div className="bg-bone-50 border border-stone-200 rounded-xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="heading-page mb-1">Gift Card Balance</h1>
            <p className="text-body-sm">Your balance is applied at checkout automatically.</p>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-lg border border-stone-300 hover:bg-stone-100 transition-avenzo"
            aria-label="Refresh"
          >
            <RefreshCw className={'w-4 h-4 text-charcoal-600 ' + (loading ? 'animate-spin' : '')} />
          </button>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-brass-900 text-bone-50 p-8 text-center shadow-card ring-1 ring-inset ring-bone-50/10">
          <div className="text-av-label uppercase tracking-wider text-brass-300 mb-2">
            Available balance
          </div>
          <div className="font-mono text-5xl font-semibold mb-2 tracking-tight">
            {loading ? '—' : `$${balance.toFixed(2)}`}
          </div>
          <div className="text-sm text-stone-300">Amazon Rebuild Gift Card balance</div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/gift-cards/redeem" className="flex-1 min-w-[180px]">
            <Button variant="secondary" className="w-full">
              Redeem a gift card
            </Button>
          </Link>
          <Link to="/products" className="flex-1 min-w-[180px]">
            <Button variant="outline" className="w-full">
              <ShoppingCart className="w-4 h-4" /> Shop now
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-info-50 border border-info-500/20 rounded-xl p-5 text-sm text-info-700">
        <strong>How it works:</strong> Your gift card balance is applied automatically at checkout. If the
        balance is less than your order total, the remaining amount is charged to your payment method.
      </div>
    </div>
  )
}
