import { Link } from 'react-router-dom'

export default function SellRegister() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Seller registration</h1>
      <p className="text-gray-600 mb-8">
        The 5-step registration wizard is coming in Module 2.
      </p>
      <Link to="/sell" className="text-[#007185] hover:underline">← Back to Sell landing</Link>
    </div>
  )
}
