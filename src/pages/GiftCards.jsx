import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gift,
  Search,
  ArrowRight,
  Sparkles,
  Mail,
  Printer,
  Package,
  Palette,
  Cake,
  Heart,
  GraduationCap,
  Star,
  Check,
  X,
  DollarSign,
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useCart } from '../context/CartContext'
import AddGiftCardModal from '../components/AddGiftCardModal'

const POPULAR = [
  {
    id: 'classic-25',
    name: 'Amazon Rebuild Gift Card',
    tagline: 'Classic blue',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-[#232f3e] to-[#131921]',
    price: 25,
    rating: 4.9,
    reviews: 12480,
    badge: 'Bestseller',
  },
  {
    id: 'birthday-50',
    name: 'Birthday Gift Card',
    tagline: 'Balloons & confetti',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-pink-500 to-rose-500',
    price: 50,
    rating: 4.8,
    reviews: 8240,
  },
  {
    id: 'holiday-100',
    name: 'Holiday Gift Card',
    tagline: 'Snowflake design',
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-blue-500 to-indigo-600',
    price: 100,
    rating: 4.7,
    reviews: 5120,
  },
  {
    id: 'thank-you-25',
    name: 'Thank You Gift Card',
    tagline: 'Minimal design',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-emerald-500 to-teal-600',
    price: 25,
    rating: 4.8,
    reviews: 3980,
  },
]

const AMAZON_CARDS = [
  {
    id: 'classic-blue',
    name: 'Amazon Rebuild Blue',
    price: 25,
    gradient: 'from-[#232f3e] to-[#131921]',
    delivery: 'email',
  },
  {
    id: 'gold',
    name: 'Amazon Rebuild Gold',
    price: 50,
    gradient: 'from-amber-500 to-yellow-500',
    delivery: 'email',
  },
  {
    id: 'silver',
    name: 'Amazon Rebuild Silver',
    price: 50,
    gradient: 'from-gray-400 to-gray-600',
    delivery: 'email',
  },
  {
    id: 'emerald',
    name: 'Amazon Rebuild Emerald',
    price: 100,
    gradient: 'from-emerald-500 to-teal-600',
    delivery: 'email',
  },
  {
    id: 'midnight',
    name: 'Amazon Rebuild Midnight',
    price: 100,
    gradient: 'from-slate-700 to-slate-900',
    delivery: 'email',
  },
  {
    id: 'sunrise',
    name: 'Amazon Rebuild Sunrise',
    price: 50,
    gradient: 'from-orange-400 to-rose-500',
    delivery: 'email',
  },
]

const DIGITAL_CARDS = [
  {
    id: 'digital-1',
    name: 'Instant eGift',
    tagline: 'Delivered in minutes',
    price: 25,
    gradient: 'from-blue-500 to-indigo-600',
    icon: Mail,
  },
  {
    id: 'digital-2',
    name: 'Print at Home',
    tagline: 'Printable PDF',
    price: 50,
    gradient: 'from-emerald-500 to-teal-600',
    icon: Printer,
  },
  {
    id: 'digital-3',
    name: 'Birthday eGift',
    tagline: 'Balloon theme',
    price: 50,
    gradient: 'from-pink-500 to-rose-500',
    icon: Cake,
  },
  {
    id: 'digital-4',
    name: 'Thank You eGift',
    tagline: 'Minimal design',
    price: 25,
    gradient: 'from-purple-500 to-fuchsia-500',
    icon: Heart,
  },
]

const PHYSICAL_CARDS = [
  {
    id: 'physical-1',
    name: 'Classic Boxed',
    tagline: 'Ships in gift box',
    price: 50,
    gradient: 'from-[#232f3e] to-[#131921]',
  },
  {
    id: 'physical-2',
    name: 'Premium Box',
    tagline: 'Foil-stamped envelope',
    price: 100,
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'physical-3',
    name: 'Birthday Box',
    tagline: 'Confetti pop-up',
    price: 50,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'physical-4',
    name: 'Wedding Card',
    tagline: 'Elegant ivory',
    price: 100,
    gradient: 'from-slate-500 to-slate-700',
  },
]

const RECOMMENDED = [
  { id: 'r1', name: 'Congratulations', price: 25, gradient: 'from-emerald-500 to-green-600', icon: GraduationCap },
  { id: 'r2', name: 'Wedding Wishes', price: 50, gradient: 'from-pink-400 to-rose-500', icon: Heart },
  { id: 'r3', name: 'New Baby', price: 50, gradient: 'from-sky-400 to-blue-500', icon: Sparkles },
  { id: 'r4', name: 'Get Well Soon', price: 25, gradient: 'from-purple-400 to-fuchsia-500', icon: Heart },
  { id: 'r5', name: 'Bon Voyage', price: 100, gradient: 'from-cyan-500 to-blue-600', icon: Star },
  { id: 'r6', name: 'Just Because', price: 25, gradient: 'from-amber-400 to-orange-500', icon: Gift },
]

export default function GiftCards() {
  const { pushToast } = useToast()
  const { addGiftCard } = useCart()
  const [claimCode, setClaimCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  function handleAddToCart(card) {
    setSelectedCard(card)
  }

  function handleRedeem(e) {
    e.preventDefault()
    if (!claimCode.trim()) {
      return pushToast('Enter a claim code', { type: 'error' })
    }
    setChecking(true)
    // Simulated redeem check — Tier 2 will wire this to the DB
    setTimeout(() => {
      setChecking(false)
      pushToast('Redeem flow coming in the next module', { type: 'info' })
    }, 800)
  }

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-[#febd69]" />
              <span className="text-sm uppercase tracking-wider text-[#febd69] font-bold">
                Gift Cards
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              The perfect gift for any occasion
            </h1>
            <p className="text-gray-200 text-lg mb-8">
              Delivered by email, printable, or shipped in a premium envelope.
              Never expires.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#popular"
                className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-6 py-3 rounded flex items-center gap-2 transition"
              >
                Shop Gift Cards <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#redeem"
                className="border border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-6 py-3 rounded transition"
              >
                Redeem a Gift Card
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#febd69] to-[#f3a847] p-6 flex flex-col justify-between shadow-2xl">
              <div className="text-gray-900 text-sm uppercase tracking-wider font-bold">
                Amazon Rebuild
              </div>
              <div className="text-gray-900">
                <div className="text-4xl font-bold">$50</div>
                <div className="text-sm mt-1">Gift Card</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY ACTIONS */}
      <section className="grid md:grid-cols-2 gap-4">
        <a
          href="#popular"
          className="bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 hover:shadow-md hover:border-gray-400 transition group"
        >
          <div className="w-14 h-14 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7 text-[#c7511f]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">Shop Gift Cards</h3>
            <p className="text-sm text-gray-600">
              Browse by occasion, design, or delivery method.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#c7511f] transition flex-shrink-0" />
        </a>

        <a
          href="#redeem"
          className="bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 hover:shadow-md hover:border-gray-400 transition group"
        >
          <div className="w-14 h-14 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-7 h-7 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">Redeem a Gift Card</h3>
            <p className="text-sm text-gray-600">
              Add balance to your account instantly.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#c7511f] transition flex-shrink-0" />
        </a>
      </section>

      {/* POPULAR GIFT CARDS */}
      <section id="popular">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Gift Cards</h2>
            <p className="text-sm text-gray-600 mt-1">
              The most-gifted designs right now.
            </p>
          </div>
          <a href="#amazon-cards" className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
            See all →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {POPULAR.map((card) => (
            <GiftCardTile
              key={card.id}
              card={card}
              showRating
              onAdd={() => handleAddToCart(card)}
            />
          ))}
        </div>
      </section>

      {/* AMAZON GIFT CARDS */}
      <section id="amazon-cards">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Amazon Rebuild Gift Cards</h2>
            <p className="text-sm text-gray-600 mt-1">
              Classic designs in every denomination.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {AMAZON_CARDS.map((card) => (
            <GiftCardTile
              key={card.id}
              card={card}
              compact
              onAdd={() => handleAddToCart(card)}
            />
          ))}
        </div>
      </section>

      {/* DIGITAL GIFT CARDS */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Digital Gift Cards</h2>
            <p className="text-sm text-gray-600 mt-1">
              Instant delivery by email or printable PDF.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DIGITAL_CARDS.map((card) => (
            <DigitalCard
              key={card.id}
              card={card}
              onAdd={() => handleAddToCart(card)}
            />
          ))}
        </div>
      </section>

      {/* PHYSICAL GIFT CARDS */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Physical Gift Cards</h2>
            <p className="text-sm text-gray-600 mt-1">
              Shipped in a premium envelope or gift box.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PHYSICAL_CARDS.map((card) => (
            <PhysicalCard
              key={card.id}
              card={card}
              onAdd={() => handleAddToCart(card)}
            />
          ))}
        </div>
      </section>

      {/* REDEEM / CHECK BALANCE */}
      <section id="redeem" className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Redeem a Gift Card
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your claim code to add the balance to your Amazon Rebuild
              account.
            </p>
            <form onSubmit={handleRedeem} className="space-y-3 max-w-md">
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXXXX-XXXX"
                className="w-full border border-gray-300 rounded px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#febd69]"
              />
              <button
                type="submit"
                disabled={checking}
                className="w-full bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-3 rounded transition disabled:opacity-60"
              >
                {checking ? 'Checking…' : 'Redeem'}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              Codes are case-insensitive. Never share your claim code with
              anyone outside Amazon Rebuild.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Your Gift Card Balance</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900">$0.00</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Redeem a gift card to add to your balance.
            </p>
            <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-3">
              Your balance is automatically applied at checkout. You can review
              your balance anytime from Your Account.
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDED */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recommended for You
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {RECOMMENDED.map((card) => (
            <RecommendedCard
              key={card.id}
              card={card}
              onAdd={() => handleAddToCart(card)}
            />
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
        {[
          { icon: Sparkles, title: 'No expiry', desc: 'Gift cards never expire.' },
          { icon: Mail, title: 'Instant delivery', desc: 'eGifts arrive in minutes.' },
          { icon: Package, title: 'Premium packaging', desc: 'Physical cards in gift boxes.' },
          { icon: Check, title: 'No fees', desc: 'No hidden charges. Ever.' },
        ].map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-[#c7511f]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-600">{f.desc}</p>
            </div>
          )
        })}
      </section>

      {selectedCard && (
        <AddGiftCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAdd={(meta) => {
            addGiftCard(meta)
            setSelectedCard(null)
          }}
        />
      )}
    </div>
  )
}

/* ============================================================
   Card components
   ============================================================ */

function GiftCardTile({ card, showRating, compact, onAdd }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group flex flex-col">
      <div
        className={
          'relative bg-gradient-to-br ' + card.gradient + ' aspect-[3/2] flex flex-col justify-between p-4'
        }
      >
        <div className="flex justify-between items-start">
          <span className="text-white text-[10px] uppercase tracking-wider font-bold drop-shadow">
            Amazon Rebuild
          </span>
          {card.badge && (
            <span className="bg-[#febd69] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded">
              {card.badge}
            </span>
          )}
        </div>
        <div className="text-white">
          <div className={'font-bold ' + (compact ? 'text-xl' : 'text-3xl')}>
            ${card.price}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-90 mt-0.5">
            Gift Card
          </div>
        </div>
      </div>

      <div className={'p-3 flex flex-col flex-1 ' + (compact ? '' : 'p-4')}>
        <h3
          className={
            'font-medium text-gray-900 leading-snug ' +
            (compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2')
          }
        >
          {card.name}
        </h3>
        {card.tagline && !compact && (
          <p className="text-xs text-gray-500 mt-0.5">{card.tagline}</p>
        )}

        {showRating && card.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-[#ffa41c] text-[#ffa41c]" />
            <span className="text-xs text-gray-700">
              {card.rating.toFixed(1)} ({card.reviews.toLocaleString()})
            </span>
          </div>
        )}

        <div className="mt-auto pt-3">
          <button
            onClick={onAdd}
            className={
              'w-full font-medium rounded transition ' +
              (compact
                ? 'text-xs bg-[#febd69] hover:bg-[#f3a847] text-gray-900 py-1.5'
                : 'text-sm bg-[#febd69] hover:bg-[#f3a847] text-gray-900 py-2')
            }
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

function DigitalCard({ card, onAdd }) {
  const Icon = card.icon
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div
        className={
          'aspect-[16/10] bg-gradient-to-br ' +
          card.gradient +
          ' flex items-center justify-center'
        }
      >
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm">{card.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{card.tagline}</p>
        <div className="flex items-baseline justify-between mt-3 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ${card.price}
          </span>
          <span className="text-xs text-green-700 font-medium">Instant</span>
        </div>
        <button
          onClick={onAdd}
          className="w-full text-sm bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-2 rounded transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

function PhysicalCard({ card, onAdd }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div
        className={
          'aspect-[16/10] bg-gradient-to-br ' +
          card.gradient +
          ' flex items-end justify-end p-4'
        }
      >
        <div className="text-right text-white">
          <div className="text-2xl font-bold">${card.price}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-90">
            Gift Card
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm">{card.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{card.tagline}</p>
        <div className="flex items-baseline justify-between mt-3 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ${card.price}
          </span>
          <span className="text-xs text-amber-700 font-medium">+$2.99 ship</span>
        </div>
        <button
          onClick={onAdd}
          className="w-full text-sm bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-2 rounded transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

function RecommendedCard({ card, onAdd }) {
  const Icon = card.icon
  return (
    <button
      onClick={onAdd}
      className="text-left bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-400 transition"
    >
      <div
        className={
          'aspect-square bg-gradient-to-br ' +
          card.gradient +
          ' flex items-center justify-center'
        }
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-medium text-gray-900 line-clamp-1">
          {card.name}
        </h3>
        <div className="text-sm font-bold text-gray-900 mt-1">${card.price}</div>
      </div>
    </button>
  )
}