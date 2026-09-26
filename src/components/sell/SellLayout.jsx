import { Outlet } from 'react-router-dom'
import SellHeader from './SellHeader'

export default function SellLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bone-50">
      <SellHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-charcoal-900 text-stone-400 text-xs py-6 text-center">
        <div className="max-w-[1400px] mx-auto px-4 space-y-2">
          <p className="text-stone-300">&copy; 2026 Avenzo Seller &mdash; a student project. Not affiliated with Amazon.com, Inc.</p>
          <p className="text-stone-500">
            All selling, payments, and verification in this demo are simulated.
          </p>
        </div>
      </footer>
    </div>
  )
}
