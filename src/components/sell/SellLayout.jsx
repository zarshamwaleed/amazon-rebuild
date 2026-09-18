import { Outlet } from 'react-router-dom'
import SellHeader from './SellHeader'

export default function SellLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SellHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#232f3e] text-gray-300 text-xs py-6 text-center">
        <div className="max-w-[1200px] mx-auto px-4 space-y-2">
          <p>© 2026 Amazon Rebuild Seller — a student project. Not affiliated with Amazon.com, Inc.</p>
          <p className="text-gray-500">
            All selling, payments, and verification in this demo are simulated.
          </p>
        </div>
      </footer>
    </div>
  )
}
