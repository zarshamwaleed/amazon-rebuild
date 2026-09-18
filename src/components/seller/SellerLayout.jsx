import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SellerHeader from './SellerHeader'
import SellerSidebar from './SellerSidebar'

const HEADER_HEIGHT = 52
const SIDEBAR_WIDTH = 240

export default function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header — spans full width, fixed at top */}
      <SellerHeader
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
      />

      {/* Fixed sidebar — never scrolls with page */}
      <aside
        className="fixed left-0 bottom-0 bg-[#131921] overflow-y-auto transition-all duration-200 z-30"
        style={{
          top: HEADER_HEIGHT,
          width: sidebarOpen ? SIDEBAR_WIDTH : 0,
          overflowX: 'hidden',
        }}
      >
        {sidebarOpen && <SellerSidebar />}
      </aside>

      {/* Main content — padding-left equals sidebar width */}
      <main
        className="transition-all duration-200"
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        }}
      >
        <div className="px-8 pb-6 mt-6">

          <Outlet />
        </div>
      </main>
    </div>
  )
}