import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#232f3e] text-white mt-10">
      <Link
        to="/"
        className="block bg-[#37475a] hover:bg-[#485769] text-center py-3 text-sm transition"
      >
        Back to top
      </Link>
      <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-8 text-sm">
        <div>
          <h4 className="font-bold mb-3">Get to Know Us</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/" className="hover:underline">About</Link></li>
            <li><Link to="/" className="hover:underline">Careers</Link></li>
            <li><Link to="/" className="hover:underline">Press</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Shop With Us</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/products" className="hover:underline">All Products</Link></li>
            <li><Link to="/cart" className="hover:underline">Your Cart</Link></li>
            <li><Link to="/orders" className="hover:underline">Your Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Let Us Help You</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/account" className="hover:underline">Your Account</Link></li>
            <li><Link to="/orders" className="hover:underline">Returns</Link></li>
            <li><Link to="/" className="hover:underline">Help</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Categories</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/category/electronics" className="hover:underline">Electronics</Link></li>
            <li><Link to="/category/books" className="hover:underline">Books</Link></li>
            <li><Link to="/category/fashion" className="hover:underline">Fashion</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Amazon Rebuild — a student project. Not affiliated with Amazon.
      </div>
    </footer>
  )
}
