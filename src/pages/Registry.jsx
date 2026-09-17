import { Link } from 'react-router-dom'
import { Baby, Heart, GraduationCap, Home } from 'lucide-react'
import Button from '../components/Button'
import { useToast } from '../context/ToastContext'

const TYPES = [
  { icon: Heart, title: 'Wedding Registry', text: 'Create a wedding wishlist and share it with guests.' },
  { icon: Baby, title: 'Baby Registry', text: 'Everything you need for your new arrival.' },
  { icon: GraduationCap, title: 'Graduation Gifts', text: 'Celebrate the milestone with the perfect gift.' },
  { icon: Home, title: 'Housewarming', text: 'Help friends and family set up their new home.' },
]

export default function Registry() {
  const { pushToast } = useToast()

  function handleCreate() {
    pushToast('Registry creation is coming soon (demo)', { type: 'info' })
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <nav className="text-xs text-gray-600 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">Registry</span>
      </nav>

      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Create a Registry</h1>
        <p className="text-rose-50">
          Build a wishlist for life's big moments and share it with the people you love.
        </p>
        <button
          onClick={handleCreate}
          className="mt-6 bg-white text-rose-600 font-semibold px-6 py-2.5 rounded hover:bg-rose-50 transition"
        >
          Get started
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TYPES.map((t) => {
          const Icon = t.icon
          return (
            <div key={t.title} className="bg-white border border-gray-200 rounded-md p-5">
              <Icon className="w-6 h-6 text-rose-500 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-sm text-gray-600">{t.text}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-10 bg-white border border-gray-200 rounded-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">How registries work</h2>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-6">
          <li>Sign in to your Amazon Rebuild account.</li>
          <li>Choose a registry type and add items from our catalog.</li>
          <li>Share your registry link with friends and family.</li>
          <li>Track who has purchased what from your registry dashboard.</li>
        </ol>
      </div>
    </div>
  )
}
