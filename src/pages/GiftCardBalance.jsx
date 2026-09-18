import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  DollarSign,
  Gift,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserGiftCardBalance } from '../services/giftCardService'

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
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Sign in to view your balance
        </h1>
        <p className="text-sm text-gray-600 mb-5">
          Your gift card balance is tied to your Amazon Rebuild account.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <Link
        to="/gift-cards"
        className="text-sm text-[#007185] hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gift Cards
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Gift Card Balance
            </h1>
            <p className="text-sm text-gray-600">
              Your balance is applied at checkout automatically.
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 rounded border border-gray-300 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white rounded-lg p-8 text-center">
          <div className="text-xs uppercase tracking-wider text-[#febd69] mb-2">
            Available balance
          </div>
          <div className="text-5xl font-bold mb-2">
            {loading ? '—' : `$${balance.toFixed(2)}`}
          </div>
          <div className="text-sm text-gray-300">Amazon Rebuild Gift Card balance</div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/gift-cards/redeem"
            className="flex-1 min-w-[180px] text-center bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            Redeem a gift card
          </Link>
          <Link
            to="/products"
            className="flex-1 min-w-[180px] text-center border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium px-5 py-2.5 rounded flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Shop now
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-sm text-blue-900">
        <strong>How it works:</strong> Your gift card balance is applied
        automatically at checkout. If the balance is less than your order total,
        the remaining amount is charged to your payment method.
      </div>
    </div>
  )
}