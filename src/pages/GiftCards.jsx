import { Link } from 'react-router-dom'
import { Gift, Heart, Cake, Briefcase } from 'lucide-react'
import Button from '../components/Button'
import { useToast } from '../context/ToastContext'

const CARDS = [
  { amount: 25, color: 'from-pink-500 to-rose-500', label: 'Happy Birthday', icon: Cake },
  { amount: 50, color: 'from-blue-600 to-indigo-600', label: 'Thank You', icon: Heart },
  { amount: 100, color: 'from-emerald-500 to-teal-600', label: 'Congratulations', icon: Gift },
  { amount: 200, color: 'from-amber-500 to-orange-600', label: 'For Any Occasion', icon: Briefcase },
]

export default function GiftCards() {
  const { pushToast } = useToast()

  function handleBuy(card) {
    pushToast('Gift cards are coming soon (demo)', { type: 'info' })
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <nav className="text-xs text-gray-600 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">Gift Cards</span>
      </nav>

      <div className="bg-gradient-to-r from-[#131921] to-[#37475a] text-white rounded-lg p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Amazon Rebuild Gift Cards</h1>
        <p className="text-gray-200">
          The perfect gift for any occasion. Delivered by email within minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.amount}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className={
                  'aspect-[16/10] bg-gradient-to-br ' +
                  c.color +
                  ' text-white flex flex-col justify-between p-4'
                }
              >
                <div className="flex justify-between">
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-bold tracking-wider">AMAZON REBUILD</span>
                </div>
                <div>
                  <div className="text-3xl font-bold">${c.amount}</div>
                  <div className="text-xs opacity-90 mt-0.5">{c.label}</div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-700 mb-3">Email delivery</div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleBuy(c)}
                >
                  Buy ${c.amount} card
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <h3 className="font-bold text-gray-900 mb-2">Custom amounts</h3>
          <p className="text-sm text-gray-600">
            Choose any amount from $5 to $500. Perfect for birthdays, thank-yous, and more.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <h3 className="font-bold text-gray-900 mb-2">Instant delivery</h3>
          <p className="text-sm text-gray-600">
            Gift cards are delivered by email within minutes of purchase.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-5">
          <h3 className="font-bold text-gray-900 mb-2">No expiration</h3>
          <p className="text-sm text-gray-600">
            Amazon Rebuild gift cards never expire. Redeem any time.
          </p>
        </div>
      </div>
    </div>
  )
}
