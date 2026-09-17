import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

const categories = [
  { name: 'All', slug: '' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Books', slug: 'books' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
  { name: 'Toys & Games', slug: 'toys-games' },
]

export default function CategoryNav() {
  return (
    <nav className="bg-[#232f3e] text-white text-sm">
      <div className="max-w-[1500px] mx-auto flex items-center gap-1 px-4 py-1.5 overflow-x-auto">
        <button className="flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap">
          <Menu className="w-4 h-4" />
          All
        </button>
        {categories.filter((c) => c.slug).map((c) => (
          <Link
            key={c.slug}
            to={'/category/' + c.slug}
            className="px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap"
          >
            {c.name}
          </Link>
        ))}
        <Link
          to="/products"
          className="px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap"
        >
          All Products
        </Link>
      </div>
    </nav>
  )
}
