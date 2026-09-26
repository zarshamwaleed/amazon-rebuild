import { Link, useLocation } from 'react-router-dom'
import useCategories from '../../hooks/useCategories'

const FEATURES = [
  { label: 'Prime Video', to: '/prime-video' },
  { label: "Today's Deals", to: '/deals' },
  { label: 'Coupons', to: '/coupons' },
  { label: 'Gift Cards', to: '/gift-cards' },
  { label: 'Registry', to: '/registry' },
  { label: 'Sell on Avenzo', to: '/sell' },
]

export default function HeaderNav() {
  const { pathname } = useLocation()
  const { categories, loading } = useCategories()

  const isActive = (to) => pathname === to || pathname.startsWith(to + '/')

  return (
    <nav aria-label="Primary" className="border-t border-stone-200/70">
      <div className="max-w-[1500px] mx-auto flex items-center gap-1 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar">
        <Link
          to="/products"
          className={
            'px-3 py-1.5 rounded-full whitespace-nowrap text-av-label uppercase tracking-wide transition-avenzo flex-shrink-0 ' +
            (isActive('/products')
              ? 'bg-charcoal-900 text-bone-50'
              : 'text-charcoal-700 hover:bg-stone-100')
          }
        >
          Shop All
        </Link>

        <span className="w-px h-4 bg-stone-300 mx-1 flex-shrink-0" aria-hidden="true" />

        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="h-6 w-20 rounded-full skeleton-shimmer flex-shrink-0"
            />
          ))}

        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={'/category/' + cat.slug}
            className={
              'px-3 py-1.5 rounded-full whitespace-nowrap text-av-label tracking-wide transition-avenzo flex-shrink-0 ' +
              (isActive('/category/' + cat.slug)
                ? 'bg-charcoal-900 text-bone-50'
                : 'text-charcoal-700 hover:bg-stone-100')
            }
          >
            {cat.name}
          </Link>
        ))}

        <span className="w-px h-4 bg-stone-300 mx-1 flex-shrink-0" aria-hidden="true" />

        {FEATURES.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={
              'px-3 py-1.5 rounded-full whitespace-nowrap text-av-label tracking-wide transition-avenzo flex-shrink-0 ' +
              (isActive(item.to)
                ? 'bg-brass-500 text-charcoal-900'
                : 'text-brass-700 hover:bg-brass-50')
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
