import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function CartButton({ compact = false }) {
  const { count } = useCart()
  const [bump, setBump] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count !== prevCount.current) {
      setBump(true)
      prevCount.current = count
      const t = setTimeout(() => setBump(false), 420)
      return () => clearTimeout(t)
    }
  }, [count])

  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className={
        'group relative flex items-center gap-2 rounded-full transition-avenzo hover:bg-stone-100 flex-shrink-0 ' +
        (compact ? 'p-2' : 'pl-3 pr-4 py-2')
      }
    >
      <span className="relative">
        <ShoppingBag
          className={
            (compact ? 'w-5 h-5 ' : 'w-6 h-6 ') +
            'text-charcoal-800 transition-transform duration-base group-hover:-translate-y-0.5'
          }
        />
        {count > 0 && (
          <span
            className={
              'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brass-500 text-bone-50 text-[10px] font-semibold flex items-center justify-center leading-none ' +
              (bump ? 'animate-bump' : '')
            }
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      {!compact && (
        <span className="hidden lg:block text-body-sm font-medium text-charcoal-900">Cart</span>
      )}
    </Link>
  )
}
