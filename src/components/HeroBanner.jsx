import { Link } from 'react-router-dom'

export default function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white overflow-hidden rounded-lg mb-6">
      <div className="relative z-10 px-6 py-12 md:px-12 md:py-20 max-w-2xl">
        <p className="text-[#febd69] text-sm font-semibold uppercase tracking-wider mb-2">
          Welcome to Amazon Rebuild
        </p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
          Shop millions of products. Delivered to your door.
        </h1>
        <p className="text-gray-200 mb-6 md:text-lg">
          Great deals across Electronics, Books, Fashion, Home, and more.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/products"
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-6 py-3 rounded transition"
          >
            Shop all products
          </Link>
          <Link
            to="/category/electronics"
            className="bg-transparent border border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-6 py-3 rounded transition"
          >
            Explore Electronics
          </Link>
        </div>
      </div>
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#febd69] opacity-10 rounded-full blur-3xl" />
      <div className="absolute -right-40 bottom-0 w-96 h-96 bg-[#ff9900] opacity-10 rounded-full blur-3xl" />
    </div>
  )
}
