import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SellerHeader from './SellerHeader'
import SellerSidebar from './SellerSidebar'

const HEADER_HEIGHT = 64
const SIDEBAR_WIDTH = 260
const SIDEBAR_WIDTH_COLLAPSED = 76

export default function SellerLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('seller-sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('seller-sidebar-collapsed', collapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [collapsed])

  // Close the mobile drawer whenever the viewport grows back to desktop width
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileOpen])

  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH

  return (
    <div className="min-h-screen bg-bone-100" style={{ '--seller-sidebar-w': sidebarWidth + 'px' }}>
      <SellerHeader
        onToggleSidebar={() => setCollapsed((c) => !c)}
        sidebarCollapsed={collapsed}
        onOpenMobileMenu={() => setMobileOpen(true)}
      />

      {/* Desktop sidebar — fixed, collapsible rail */}
      <aside
        className="hidden lg:block fixed left-0 bottom-0 top-16 bg-charcoal-900 overflow-y-auto overflow-x-hidden transition-[width] duration-base ease-avenzo-out z-30 no-scrollbar"
        style={{ width: sidebarWidth }}
      >
        <SellerSidebar collapsed={collapsed} />
      </aside>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px] animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-charcoal-900 overflow-y-auto no-scrollbar animate-[slideInLeft_320ms_cubic-bezier(0.16,1,0.3,1)_both] shadow-lifted">
            <SellerSidebar collapsed={false} onNavigate={() => setMobileOpen(false)} showCloseButton onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="pt-16 pl-0 lg:pl-[var(--seller-sidebar-w)] transition-[padding-left] duration-base ease-avenzo-out">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
