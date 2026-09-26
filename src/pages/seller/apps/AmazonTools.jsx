import { Link } from 'react-router-dom'
import {
  Bot,
  TrendingUp,
  Calculator,
  GraduationCap,
  Rocket,
  BarChart3,
  Shield,
  Package,
  Megaphone,
  DollarSign,
  Globe,
  Zap,
  FileText,
  Users,
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import SellerPageHeader from '../../../components/seller/SellerPageHeader'
import Card from '../../../components/Card'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'

const TOOLS = [
  {
    id: 'seller-app',
    name: 'Amazon Seller App',
    category: 'Mobile',
    description:
      'Manage your entire business from your phone — listings, orders, inventory, and messages on the go.',
    icon: Bot,
    color: 'from-blue-500 to-indigo-600',
    to: null,
    cta: 'Download app',
  },
  {
    id: 'automate-pricing',
    name: 'Automate Pricing',
    category: 'Pricing',
    description:
      'Set pricing rules that adjust your prices automatically based on competitor pricing, buy box position, and min/max guardrails.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    to: '/seller/pricing/automate',
    cta: 'Set up rules',
  },
  {
    id: 'fba-calc',
    name: 'FBA Revenue Calculator',
    category: 'Fulfillment',
    description:
      'Estimate Amazon fulfillment fees, referral fees, and net profit before you send inventory to a fulfillment center.',
    icon: Calculator,
    color: 'from-amber-500 to-orange-600',
    to: null,
    cta: 'Open calculator',
  },
  {
    id: 'seller-uni',
    name: 'Seller University',
    category: 'Training',
    description:
      'Free training videos, guides, and best practices to help you grow from your first sale to a full-scale business.',
    icon: GraduationCap,
    color: 'from-purple-500 to-fuchsia-600',
    to: null,
    cta: 'Browse courses',
  },
  {
    id: 'growth',
    name: 'Growth Opportunities',
    category: 'Growth',
    description:
      'Personalized recommendations to improve your listings, optimize inventory, and increase sales across your catalog.',
    icon: Rocket,
    color: 'from-rose-500 to-pink-600',
    to: '/seller/growth',
    cta: 'View recommendations',
  },
  {
    id: 'brand-analytics',
    name: 'Brand Analytics',
    category: 'Analytics',
    description:
      'Deep insights into search terms, market basket analysis, and customer demographics — available to brand-registered sellers.',
    icon: BarChart3,
    color: 'from-cyan-500 to-blue-600',
    to: null,
    cta: 'Open Brand Analytics',
  },
  {
    id: 'account-health',
    name: 'Account Health Dashboard',
    category: 'Performance',
    description:
      'Monitor your performance metrics and policy compliance in real time to stay in good standing.',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    to: '/seller/account-health',
    cta: 'View dashboard',
  },
  {
    id: 'inventory-planner',
    name: 'FBA Inventory Planner',
    category: 'Fulfillment',
    description:
      'Forecast demand and get restock recommendations based on sales velocity and seasonal trends.',
    icon: Package,
    color: 'from-violet-500 to-purple-600',
    to: '/seller/inventory',
    cta: 'Open planner',
  },
  {
    id: 'ads-console',
    name: 'Amazon Ads Console',
    category: 'Advertising',
    description:
      'Manage Sponsored Products, Brands, and Display campaigns. Track impressions, clicks, spend, and ROAS in one place.',
    icon: Megaphone,
    color: 'from-amber-500 to-yellow-500',
    to: '/seller/advertising',
    cta: 'Open Ads Console',
  },
  {
    id: 'payments-dashboard',
    name: 'Payments Dashboard',
    category: 'Finance',
    description:
      'Track your balance, upcoming payouts, transaction history, and Amazon fees in one view.',
    icon: DollarSign,
    color: 'from-green-600 to-emerald-600',
    to: '/seller/payments',
    cta: 'View payments',
  },
  {
    id: 'marketplace-switcher',
    name: 'Marketplace Switcher',
    category: 'Global',
    description:
      'Expand your business internationally. Switch between North America, Europe, and Asia-Pacific marketplaces.',
    icon: Globe,
    color: 'from-teal-500 to-green-600',
    to: null,
    cta: 'Explore marketplaces',
  },
  {
    id: 'coupon-manager',
    name: 'Coupon Manager',
    category: 'Marketing',
    description: 'Create and manage discount coupons. Set budgets, dates, and eligibility rules.',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    to: '/seller/coupons',
    cta: 'Create coupon',
  },
  {
    id: 'business-reports',
    name: 'Business Reports',
    category: 'Analytics',
    description: 'Detailed sales, traffic, and conversion reports with custom date ranges and CSV export.',
    icon: FileText,
    color: 'from-indigo-500 to-purple-600',
    to: '/seller/reports',
    cta: 'View reports',
  },
  {
    id: 'team-management',
    name: 'Team Management',
    category: 'Account',
    description: 'Invite team members, assign roles, and control permissions across your seller account.',
    icon: Users,
    color: 'from-blue-600 to-cyan-500',
    to: '/seller/settings/users',
    cta: 'Manage team',
  },
]

export default function AmazonTools() {
  const { pushToast } = useToast()

  function openTool(tool) {
    if (tool.to) {
      window.location.href = tool.to
    } else {
      pushToast(tool.name + ' — demo only', { type: 'info' })
    }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Amazon Tools"
        description="Free tools provided by Amazon to help you run and grow your business."
        backTo="/seller/apps-services"
      />

      {/* Info banner */}
      <div className="bg-brass-50 border border-brass-200 rounded-xl p-4 text-sm text-brass-800">
        These tools are included with your seller account — no additional cost. They complement the third-party
        apps available in the{' '}
        <Link to="/seller/apps-services/appstore" className="font-medium underline hover:no-underline">
          Selling Partner Appstore
        </Link>
        .
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isLive = Boolean(tool.to)
          return (
            <button key={tool.id} onClick={() => openTool(tool)} className="text-left">
              <Card hoverable className={'h-full flex flex-col ' + (isLive ? '' : 'opacity-90')}>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={
                      'w-11 h-11 rounded-lg bg-gradient-to-br ' + tool.color + ' flex items-center justify-center flex-shrink-0'
                    }
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge color="gray">{tool.category}</Badge>
                </div>

                <h3 className="font-semibold text-charcoal-900 text-sm mb-1">{tool.name}</h3>
                <p className="text-xs text-charcoal-500 line-clamp-3 mb-4 flex-1">{tool.description}</p>

                <span className={'text-sm font-medium text-left ' + (isLive ? 'text-brass-600' : 'text-charcoal-400')}>
                  {tool.cta} →
                </span>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Help footer */}
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-charcoal-900 mb-0.5">Need help getting started?</div>
          <p className="text-body-sm">Visit Seller University for free training or open a support case.</p>
        </div>
        <Link to="/seller/help">
          <Button variant="outline">Visit Help Center</Button>
        </Link>
      </Card>
    </div>
  )
}
