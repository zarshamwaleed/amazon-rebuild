import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  Package,
  Truck,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCustomerReturns } from '../services/customerReturnService'

const STATUS_META = {
  requested: { label: 'Requested', cls: 'bg-blue-100 text-blue-800', icon: Clock },
  pending_authorization: { label: 'Pending Authorization', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  authorized: { label: 'Authorized', cls: 'bg-blue-100 text-blue-800', icon: Truck },
  return_in_transit: { label: 'In Transit', cls: 'bg-indigo-100 text-indigo-800', icon: Truck },
  return_received: { label: 'Return Received', cls: 'bg-cyan-100 text-cyan-800', icon: Package },
  refund_pending: { label: 'Refund Pending', cls: 'bg-amber-100 text-amber-800', icon: DollarSign },
  refunded: { label: 'Refunded', cls: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  declined: { label: 'Declined', cls: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800', icon: CheckCircle2 },
}

export default function MyReturns() {
  const { user } = useAuth()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user?.email) return
    try {
      setLoading(true)
      const list = await getCustomerReturns(user.email)
      setReturns(list)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Sign in to view your returns.
        </p>
        <Link
          to="/login"
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/orders"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Your Returns</h1>
          <p className="text-sm text-gray-600">
            Track your return requests and refunds.
          </p>
        </div>
        <button
          onClick={load}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading your returns…
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No returns yet
          </h3>
          <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
            To return an item, open your order history and click "Return this
            item" next to the product you want to return.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            <Package className="w-4 h-4" /> View your orders
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => {
            const meta = STATUS_META[r.status] || STATUS_META.requested
            const Icon = meta.icon
            return (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row gap-4"
              >
                {r.product_image ? (
                  <img
                    src={r.product_image}
                    alt=""
                    className="w-20 h-20 rounded object-cover border flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded bg-gray-100 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">
                      {r.rma}
                    </span>
                    <span
                      className={
                        'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ' +
                        meta.cls
                      }
                    >
                      <Icon className="w-3 h-3" /> {meta.label}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {r.product_title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reason: {r.return_reason}
                  </div>
                  {r.customer_comment && (
                    <div className="text-xs text-gray-600 mt-2 italic">
                      "{r.customer_comment}"
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Requested {new Date(r.requested_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {Number(r.refund_amount) > 0 ? (
                    <>
                      <div className="text-xs text-gray-500">Refunded</div>
                      <div className="text-lg font-bold text-green-700">
                        ${Number(r.refund_amount).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">No refund yet</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}