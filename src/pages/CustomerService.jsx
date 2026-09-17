import { Link } from 'react-router-dom'
import { Package, RefreshCw, CreditCard, MessageCircle, MapPin, Lock } from 'lucide-react'

const TOPICS = [
  { icon: Package, title: 'Track your package', text: 'View order status and delivery progress.', to: '/orders' },
  { icon: RefreshCw, title: 'Returns & replacements', text: 'Start a return or exchange.', to: '/orders' },
  { icon: CreditCard, title: 'Payment & pricing', text: 'Manage payment methods and promo codes.', to: '/account' },
  { icon: MapPin, title: 'Addresses', text: 'Add or update your shipping addresses.', to: '/account' },
  { icon: Lock, title: 'Account & security', text: 'Update your password and account details.', to: '/account' },
  { icon: MessageCircle, title: 'Contact us', text: 'Chat with a support agent (demo).', to: '/customer-service' },
]

export default function CustomerService() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <nav className="text-xs text-gray-600 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">Customer Service</span>
      </nav>

      <div className="bg-[#232f3e] text-white rounded-lg p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Hello, how can we help?</h1>
        <p className="text-gray-200">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOPICS.map((t) => {
          const Icon = t.icon
          return (
            <Link
              key={t.title}
              to={t.to}
              className="bg-white border border-gray-200 rounded-md p-5 hover:shadow-md transition"
            >
              <Icon className="w-6 h-6 text-[#c7511f] mb-3" />
              <h2 className="font-semibold text-gray-900 mb-1">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.text}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Frequently asked questions</h2>
        <dl className="divide-y">
          <div className="py-3">
            <dt className="font-medium text-gray-900">Where is my order?</dt>
            <dd className="text-sm text-gray-600 mt-1">
              Track your order from <Link to="/orders" className="text-blue-600 hover:underline">Your Orders</Link>.
            </dd>
          </div>
          <div className="py-3">
            <dt className="font-medium text-gray-900">How do I return an item?</dt>
            <dd className="text-sm text-gray-600 mt-1">
              Open the order, choose the item, and select "Return or replace". Returns are free within 30 days.
            </dd>
          </div>
          <div className="py-3">
            <dt className="font-medium text-gray-900">How do I change my shipping address?</dt>
            <dd className="text-sm text-gray-600 mt-1">
              Go to <Link to="/account" className="text-blue-600 hover:underline">Your Account</Link> or add a new
              address during checkout.
            </dd>
          </div>
          <div className="py-3">
            <dt className="font-medium text-gray-900">Is my payment information secure?</dt>
            <dd className="text-sm text-gray-600 mt-1">
              Yes. Payments in Amazon Rebuild are simulated; no real card data is collected or stored.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
