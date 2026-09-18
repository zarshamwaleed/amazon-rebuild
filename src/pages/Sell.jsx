import { useState } from 'react'
import { DollarSign, Package, ShoppingCart, Box } from 'lucide-react'
import Button from '../components/Button'

const STATS = [
  { label: 'Sales', value: '$4,829.00', icon: DollarSign },
  { label: 'Orders', value: '124', icon: ShoppingCart },
  { label: 'Products', value: '38', icon: Package },
  { label: 'Inventory', value: '1,284', icon: Box },
]

const MOCK_PRODUCTS = [
  { title: 'Wireless Headphones', stock: 42, price: 199.99 },
  { title: 'Smart Watch', stock: 15, price: 149.99 },
  { title: 'Gaming Keyboard', stock: 8, price: 89.99 },
]

export default function Sell() {
  const [tab, setTab] = useState('overview')
  const TABS = ['overview', 'products', 'orders', 'inventory', 'profile']

  return (
    <div>
      <div className="bg-[#232f3e] text-white rounded-lg p-6 md:p-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Seller Central</h1>
        <p className="text-gray-300 text-sm">
          Manage your store, products, and orders. (Demo — data is illustrative.)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition ' +
              (tab === t
                ? 'border-[#c7511f] text-[#c7511f]'
                : 'border-transparent text-gray-700 hover:text-gray-900')
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STATS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="bg-white border border-gray-200 rounded-md p-5">
                  <Icon className="w-5 h-5 text-[#c7511f] mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div>
                </div>
              )
            })}
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Manage Products</h2>
              <Button variant="secondary" onClick={() => alert('Add Product — demo only')}>
                + Add Product
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">Stock</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRODUCTS.map((p) => (
                  <tr key={p.title} className="border-b last:border-b-0">
                    <td className="py-3 text-gray-900">{p.title}</td>
                    <td className="py-3 text-right text-gray-700">{p.stock}</td>
                    <td className="py-3 text-right text-gray-700">${p.price.toFixed(2)}</td>
                    <td className="py-3 text-right space-x-2">
                      <button className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab !== 'overview' && (
        <div className="bg-white border border-gray-200 rounded-md p-10 text-center text-sm text-gray-600">
          {tab.charAt(0).toUpperCase() + tab.slice(1)} page — demo content.
        </div>
      )}
    </div>
  )
}
