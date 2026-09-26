import { Link } from 'react-router-dom'
import { Ticket, CircleCheck, Clock, XCircle, ImageOff, ArrowRight } from 'lucide-react'
import { useCoupons } from '../context/CouponsContext'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { formatPrice } from '../lib/utils'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** A clipped coupon card. `status` drives the footer badge and dimming for used/expired rows. */
function MyCouponCard({ row }) {
  const c = row.coupon
  const product = c?.products?.[0]
  const discountLabel =
    c?.discount_type === 'percentage'
      ? `${Number(c.discount_value)}% off`
      : `${formatPrice(c?.discount_value)} off`

  const isUsed = row.status === 'used'
  const isExpired = row.status === 'expired'
  const muted = isUsed || isExpired

  return (
    <div
      className={
        'relative flex flex-col bg-bone-50 border border-stone-200 rounded-2xl overflow-hidden shadow-subtle transition-avenzo ' +
        (muted ? 'opacity-70' : 'hover:shadow-card hover:border-stone-300')
      }
    >
      {product && (
        <Link
          to={`/products/${product.id}`}
          className={'block aspect-[4/3] bg-stone-100 overflow-hidden ' + (muted ? 'grayscale' : '')}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-6 h-6 text-charcoal-300" strokeWidth={1.5} />
            </div>
          )}
        </Link>
      )}

      {/* Perforated seam with punch-hole notches, coupon-stub style */}
      <div className="relative shrink-0">
        <span className="absolute -left-2.5 top-0 -translate-y-1/2 w-5 h-5 rounded-full bg-bone-100" />
        <span className="absolute -right-2.5 top-0 -translate-y-1/2 w-5 h-5 rounded-full bg-bone-100" />
        <div className="border-t border-dashed border-stone-300 mx-4" />
      </div>

      <div className="p-4 pt-3.5 flex flex-col flex-1">
        <div className={'text-price-lg ' + (muted ? 'text-charcoal-500' : 'text-brass-600')}>
          {discountLabel}
        </div>
        <p className="text-body-sm line-clamp-2 mt-1 mb-2">{c?.description}</p>
        {product && (
          <Link
            to={`/products/${product.id}`}
            className="text-sm font-medium text-charcoal-800 hover:text-charcoal-900 line-clamp-2 transition-avenzo mb-3"
          >
            {product.title}
          </Link>
        )}

        <div className="mt-auto pt-1">
          {isUsed && (
            <Badge color="gray">
              <CircleCheck className="w-3 h-3" strokeWidth={2.5} />
              Used {formatDate(row.used_at)}
            </Badge>
          )}
          {isExpired && (
            <Badge color="red">
              <XCircle className="w-3 h-3" strokeWidth={2.5} />
              Expired
            </Badge>
          )}
          {!muted && (
            <Badge color="green">
              <CircleCheck className="w-3 h-3" strokeWidth={2.5} />
              Clipped {row.clipped_at ? formatDate(row.clipped_at) : ''}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyCoupons() {
  const { user } = useAuth()
  const { dbCoupons, ready } = useCoupons()

  if (!ready) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-brass-500 animate-spin" />
        <p className="text-body-sm">Loading your coupons…</p>
      </div>
    )
  }

  // Signed-in user: read from DB rows
  const rows = user ? dbCoupons.filter((r) => r.coupon) : []

  const available = rows.filter((r) => r.status !== 'used' && r.status !== 'expired')
  const used = rows.filter((r) => r.status === 'used')
  const expired = rows.filter((r) => r.status === 'expired')

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <p className="text-av-label uppercase tracking-wide font-medium text-brass-600 mb-1.5 flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" /> Savings
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="heading-page">Your Coupons</h1>
            <p className="text-body-sm mt-1.5">
              {rows.length} coupon{rows.length !== 1 ? 's' : ''} clipped
            </p>
          </div>
          <Link
            to="/coupons"
            className="text-sm font-medium text-charcoal-700 hover:text-brass-600 inline-flex items-center gap-1 transition-avenzo"
          >
            Browse more coupons
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {!user && (
        <EmptyState
          icon={Ticket}
          title="Sign in to see your coupons"
          message="Coupons you clip will be saved to your account."
        />
      )}

      {user && rows.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="You haven't clipped any coupons yet"
          message="Find savings on products you love."
          action={
            <Link to="/coupons">
              <Button>Explore Coupons</Button>
            </Link>
          }
        />
      )}

      {available.length > 0 && (
        <section className="mb-10">
          <h2 className="heading-section mb-4 flex items-center gap-2">
            Available
            <Badge color="green" variant="chip">
              {available.length}
            </Badge>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {available.map((r) => (
              <MyCouponCard key={r.id} row={r} />
            ))}
          </div>
        </section>
      )}

      {used.length > 0 && (
        <section className="mb-10">
          <h2 className="heading-section mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-charcoal-400" />
            Used
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {used.map((r) => (
              <MyCouponCard key={r.id} row={r} />
            ))}
          </div>
        </section>
      )}

      {expired.length > 0 && (
        <section className="mb-10">
          <h2 className="heading-section mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-charcoal-400" />
            Expired
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expired.map((r) => (
              <MyCouponCard key={r.id} row={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
