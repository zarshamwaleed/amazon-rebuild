import { Link } from 'react-router-dom'
import { useCoupons } from '../context/CouponsContext'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'

export default function MyCoupons() {
  const { user } = useAuth()
  const { dbCoupons, ready } = useCoupons()

  if (!ready) {
    return (
      <div className="py-20 text-center text-sm text-gray-600">
        Loading your coupons…
      </div>
    )
  }

  // Signed-in user: read from DB rows
  const rows = user
    ? dbCoupons.filter((r) => r.coupon)
    : []

  const available = rows.filter((r) => r.status !== 'used' && r.status !== 'expired')
  const used = rows.filter((r) => r.status === 'used')
  const expired = rows.filter((r) => r.status === 'expired')

  function renderCard(row) {
    const c = row.coupon
    const product = c?.products?.[0]
    const label =
      c?.discount_type === 'percentage'
        ? `${Number(c.discount_value)}% off`
        : `$${Number(c.discount_value)} off`

    return (
      <div
        key={row.id}
        className="bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col"
      >
        {product && (
          <Link to={`/products/${product.id}`} className="block aspect-square bg-gray-50 overflow-hidden">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            )}
          </Link>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="text-xs font-bold text-[#b12704] uppercase mb-1">{label}</div>
          <div className="text-sm text-gray-600 mb-3 line-clamp-2">{c?.description}</div>
          {product && (
            <Link
              to={`/products/${product.id}`}
              className="text-sm font-medium text-gray-900 hover:text-[#c7511f] line-clamp-2 mb-3"
            >
              {product.title}
            </Link>
          )}
          <div className="mt-auto text-xs text-green-700 font-medium">✓ Clipped</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Coupons</h1>
        <Link
          to="/coupons"
          className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
        >
          Browse more coupons →
        </Link>
      </div>

      {!user && (
        <EmptyState
          title="Sign in to see your coupons"
          message="Coupons you clip will be saved to your account."
        />
      )}

      {user && rows.length === 0 && (
        <>
          <EmptyState
            title="You haven't clipped any coupons yet"
            message="Find savings on products you love."
          />
          <div className="text-center mt-6">
            <Link
              to="/coupons"
              className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded transition"
            >
              Explore Coupons
            </Link>
          </div>
        </>
      )}

      {available.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Available</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {available.map(renderCard)}
          </div>
        </section>
      )}

      {used.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Used</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {used.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-md p-4 opacity-60"
              >
                <div className="text-sm text-gray-600">
                  Used on {r.used_at ? new Date(r.used_at).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {expired.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Expired</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expired.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-md p-4 opacity-60"
              >
                <div className="text-sm text-gray-600">Expired</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}