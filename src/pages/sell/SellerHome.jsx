import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSeller } from '../../hooks/useSeller'

export default function SellerHome() {
  const { seller, loading } = useSeller()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !seller) navigate('/sell/register', { replace: true })
  }, [seller, loading, navigate])

  if (loading) {
    return <div className="p-20 text-center text-sm text-gray-600">Loading Seller Central…</div>
  }
  if (!seller) return null

  return (
    <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome, {seller.store_name || 'Seller'}
      </h1>
      <p className="text-gray-600 mb-6">
        Your Seller Central dashboard is coming in Module 4.
      </p>
      <p className="text-xs text-gray-500">
        Plan: <strong>{seller.plan}</strong> · Categories:{' '}
        {(seller.product_categories || []).join(', ') || '—'}
      </p>
      <Link to="/sell" className="inline-block mt-6 text-[#007185] hover:underline">
        ← Back to Sell landing
      </Link>
    </div>
  )
}