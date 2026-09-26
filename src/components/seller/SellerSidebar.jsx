import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Package,
  Box,
  ShoppingCart,
  DollarSign,
  Megaphone,
  Store,
  TrendingUp,
  FileText,
  CreditCard,
  Activity,
  Users,
  Grid3x3,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  Truck,
  X,
} from 'lucide-react'

const NAV = [
  { label: 'Home', to: '/seller', icon: Home, end: true },
  {
    label: 'Catalog',
    icon: Package,
    children: [
      { label: 'Add Products', to: '/seller/products/new' },
      { label: 'Manage Products', to: '/seller/products' },
    ],
  },
  {
    label: 'Inventory',
    icon: Box,
    children: [
      { label: 'Manage Inventory', to: '/seller/inventory' },
      
    ],
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    children: [
      { label: 'Manage Orders', to: '/seller/orders' },
      { label: 'Returns', to: '/seller/orders/returns' },
    ],
  },
  {
    label: 'Fulfillment',
    icon: Truck,
    children: [
      { label: 'FBA', to: '/seller/fulfillment?tab=FBA' },
      { label: 'FBM', to: '/seller/fulfillment?tab=FBM' },
    ],
  },
  {
    label: 'Pricing',
    icon: DollarSign,
    children: [
      { label: 'Manage Pricing', to: '/seller/pricing' },
      { label: 'Automate Pricing', to: '/seller/pricing/automate' },
    ],
  },
  {
    label: 'Advertising',
    icon: Megaphone,
    children: [
      { label: 'Campaign Manager', to: '/seller/advertising' },
      { label: 'Coupons', to: '/seller/coupons' },
      { label: 'Deals', to: '/seller/deals' },
    ],
  },
  {
    label: 'Stores',
    icon: Store,
    children: [{ label: 'Brand Store', to: '/seller/store' }],
  },
  { label: 'Growth', to: '/seller/growth', icon: TrendingUp },
  { label: 'Reports', to: '/seller/reports', icon: FileText },
  { label: 'Payments', to: '/seller/payments', icon: CreditCard },
  {
    label: 'Performance',
    icon: Activity,
    children: [{ label: 'Account Health', to: '/seller/account-health' }],
  },
  {
    label: 'Customers',
    icon: Users,
    children: [
      { label: 'Customer Insights', to: '/seller/customers' },
      { label: 'Reviews', to: '/seller/reviews' },
      { label: 'Messages', to: '/seller/messages' },
    ],
  },
  {
    label: 'Apps & Services',
    icon: Grid3x3,
    children: [
      { label: 'Explore Apps', to: '/seller/apps-services' },
      { label: 'Selling Partner Appstore', to: '/seller/apps-services/appstore' },
      { label: 'Service Providers', to: '/seller/apps-services/providers' },
      { label: 'Manage Your Apps', to: '/seller/apps-services/manage' },
      { label: 'Amazon Tools', to: '/seller/apps-services/tools' },
    ],
  },
  { label: 'Settings', to: '/seller/settings', icon: SettingsIcon },
]

export default function SellerSidebar({ collapsed = false, onNavigate, showCloseButton = false, onClose }) {
  const location = useLocation()
  const [open, setOpen] = useState(() => {
    const initial = {}
    for (const n of NAV) {
      if (n.children?.some((c) => location.pathname.startsWith(c.to))) initial[n.label] = true
    }
    return initial
  })

  function toggle(label) {
    setOpen((o) => ({ ...o, [label]: !o[label] }))
  }

  return (
    <div className="py-4">
      {showCloseButton && (
        <div className="flex items-center justify-between px-4 pb-3 mb-1 border-b border-white/10">
          <span className="font-display text-bone-50 text-sm">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-bone-50 hover:bg-white/5 transition-avenzo"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="space-y-0.5 px-2">
        {NAV.map((item) => {
          const Icon = item.icon

          if (item.children) {
            const expanded = !collapsed && open[item.label]
            const anyChildActive = item.children.some((c) => location.pathname.startsWith(c.to))

            return (
              <div key={item.label} className="relative group">
                <button
                  onClick={() => !collapsed && toggle(item.label)}
                  title={collapsed ? item.label : undefined}
                  className={
                    'w-full flex items-center gap-3 rounded-lg text-sm transition-avenzo ' +
                    (collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5') +
                    ' ' +
                    (anyChildActive ? 'text-bone-50 bg-white/[0.06]' : 'text-stone-400 hover:text-bone-100 hover:bg-white/5')
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {expanded ? (
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </>
                  )}
                </button>

                {/* Expanded rail: inline children list */}
                {expanded && (
                  <div className="mt-0.5 ml-[22px] pl-3.5 border-l border-white/10 space-y-0.5">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        end
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          'block rounded-md px-3 py-1.5 text-sm transition-avenzo ' +
                          (isActive
                            ? 'text-brass-300 bg-white/[0.06] font-medium'
                            : 'text-stone-400 hover:text-bone-100 hover:bg-white/5')
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}

                {/* Collapsed rail: hover flyout with the group's children */}
                {collapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full top-0 ml-2 min-w-[200px] bg-charcoal-800 border border-white/10 rounded-xl shadow-lifted py-2 z-40">
                    <div className="px-3.5 pb-1.5 mb-1 border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-stone-400">
                      {item.label}
                    </div>
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        end
                        className={({ isActive }) =>
                          'block px-3.5 py-1.5 text-sm transition-avenzo ' +
                          (isActive ? 'text-brass-300 font-medium' : 'text-stone-300 hover:text-bone-50 hover:bg-white/5')
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-avenzo relative ' +
                (collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5') +
                ' ' +
                (isActive
                  ? 'text-bone-50 bg-white/[0.08]'
                  : 'text-stone-400 hover:text-bone-100 hover:bg-white/5')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-brass-400" />
                  )}
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
