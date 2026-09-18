import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Package, Box, ShoppingCart, DollarSign, Megaphone, Store,
  TrendingUp, FileText, CreditCard, Activity, Users, Grid3x3,
  Settings as SettingsIcon, ChevronDown, ChevronRight, Truck, Tag,
  TrendingDown,
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
      { label: 'FBA Inventory', to: '/seller/inventory/fba' },
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
  { label: 'Customers', to: '/seller/customers', icon: Users },
  { label: 'Apps & Services', to: '/seller/apps', icon: Grid3x3 },
  { label: 'Settings', to: '/seller/settings', icon: SettingsIcon },
]

export default function SellerSidebar() {
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
    <aside className="w-60 bg-[#131921] text-white min-h-full py-4">
      <nav className="space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon

          // Parent with children
          if (item.children) {
            const expanded = open[item.label]
            const anyChildActive = item.children.some((c) =>
              location.pathname.startsWith(c.to)
            )
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={
                    'w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition ' +
                    (anyChildActive ? 'text-white font-medium' : 'text-gray-300')
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {expanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                {expanded && (
                  <div className="pl-4">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        end
                        className={({ isActive }) =>
                          'block pl-6 pr-4 py-1.5 text-sm transition border-l ' +
                          (isActive
                            ? 'border-[#febd69] text-white bg-white/5'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5')
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

          // Simple link
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'flex items-center gap-2 px-4 py-2 text-sm transition ' +
                (isActive
                  ? 'bg-white/10 text-white border-l-4 border-[#febd69] pl-3'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent pl-3')
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}