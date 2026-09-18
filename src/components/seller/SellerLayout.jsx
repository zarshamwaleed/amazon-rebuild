import { Outlet } from 'react-router-dom'
import SellerHeader from './SellerHeader'
import SellerSidebar from './SellerSidebar'

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <SellerHeader />
      <div className="flex flex-1">
        <SellerSidebar />
        <main className="flex-1 min-w-0 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}