export const SUPPORT_CATEGORIES = [
  { id: 'account', label: 'Account', description: 'Login, permissions, plan changes' },
  { id: 'products', label: 'Products', description: 'Listing, images, variations' },
  { id: 'orders', label: 'Orders', description: 'Shipping, cancellations, refunds' },
  { id: 'inventory', label: 'Inventory', description: 'Stock, FBA, restocking' },
  { id: 'payments', label: 'Payments', description: 'Payouts, fees, invoices' },
  { id: 'shipping', label: 'Shipping', description: 'Rates, carriers, labels' },
  { id: 'advertising', label: 'Advertising', description: 'Campaigns, targeting, budget' },
  { id: 'policies', label: 'Policies', description: 'Rules, compliance, IP' },
]

export const FAQS = [
  {
    id: 'faq-1',
    category: 'account',
    question: 'How do I change my selling plan?',
    answer:
      'Go to Settings → Selling Plan. You can switch between Individual ($0.99 per item) and Professional ($39.99 per month) at any time. Changes take effect on the next billing cycle.',
  },
  {
    id: 'faq-2',
    category: 'account',
    question: 'Can I add team members to my seller account?',
    answer:
      'Yes. Go to Settings → User Permissions to invite team members and assign roles (Administrator, Manager, Employee, Analyst). Each user gets their own login with scoped permissions.',
  },
  {
    id: 'faq-3',
    category: 'products',
    question: 'Why is my listing not showing in search?',
    answer:
      'Common reasons: missing images, missing description, out of stock, or flagged for policy review. Check Account Health for specific alerts. Fixing the issue usually restores the listing within 24 hours.',
  },
  {
    id: 'faq-4',
    category: 'products',
    question: 'How many images should each product have?',
    answer:
      'At least one high-quality main image on a pure white background. We recommend 5–7 images total, including lifestyle shots, close-ups, and a size/scale reference.',
  },
  {
    id: 'faq-5',
    category: 'products',
    question: 'How do I create product variations?',
    answer:
      'Open the product in the listing editor, expand the Variations section, and add variations (e.g., Color with values Black, White, Blue). Each variation becomes a child SKU under the parent listing.',
  },
  {
    id: 'faq-6',
    category: 'orders',
    question: 'What is the deadline to ship an order?',
    answer:
      'Standard orders must ship within 2 business days. Late shipments affect your Late Shipment Rate; keep it under 4% to stay in Healthy status.',
  },
  {
    id: 'faq-7',
    category: 'orders',
    question: 'How do I process a refund?',
    answer:
      'Open the order in Manage Orders, click Refund, choose the refund amount and reason. Refunds are deducted from your next payout.',
  },
  {
    id: 'faq-8',
    category: 'orders',
    question: 'Can I cancel an order after the customer places it?',
    answer:
      'Yes, but pre-fulfillment cancellations count toward your Cancellation Rate. Keep it under 2.5% to stay Healthy.',
  },
  {
    id: 'faq-9',
    category: 'inventory',
    question: 'What is the difference between FBA and FBM?',
    answer:
      'FBA: Amazon stores, picks, packs, and ships your products — you send inventory to a fulfillment center. FBM: You handle storage, packing, and shipping yourself.',
  },
  {
    id: 'faq-10',
    category: 'inventory',
    question: 'How often should I restock?',
    answer:
      'Keep at least 4–6 weeks of cover on top sellers. Set a low-stock threshold on each product so you get an alert before you run out.',
  },
  {
    id: 'faq-11',
    category: 'payments',
    question: 'When do I get paid?',
    answer:
      'Payouts are processed every 14 days and deposited into your linked bank account. Orders in the last 14 days remain in the Next Payout balance until cleared.',
  },
  {
    id: 'faq-12',
    category: 'payments',
    question: 'What fees does Amazon Rebuild charge?',
    answer:
      'Individual sellers pay $0.99 per item sold. Professional sellers pay $39.99 per month. A 15% referral fee applies to most categories. Payment processing and FBA fees (if applicable) are additional.',
  },
  {
    id: 'faq-13',
    category: 'shipping',
    question: 'Can I use my own shipping carrier?',
    answer:
      'Yes. FBM sellers can use any carrier with tracking. Amazon Rebuild Buy Shipping is also available and offers discounted rates.',
  },
  {
    id: 'faq-14',
    category: 'shipping',
    question: 'How do I print a shipping label?',
    answer:
      'Open the order in Fulfillment, click Print Label. We generate a PDF with the buyer\'s address and a tracking number. Attach it to the package and hand off to your carrier.',
  },
  {
    id: 'faq-15',
    category: 'advertising',
    question: 'What is a good ROAS for Sponsored Products?',
    answer:
      'Aim for at least 3× return on ad spend. Below 1× means you\'re losing money on ads. Below 3× means you\'re profitable but should optimize targeting and bids.',
  },
  {
    id: 'faq-16',
    category: 'advertising',
    question: 'How do I improve my CTR?',
    answer:
      'Improve your main image, sharpen your title, and increase your bid slightly to appear in top placements. CTR above 0.5% is healthy for most categories.',
  },
  {
    id: 'faq-17',
    category: 'policies',
    question: 'What are the most common policy violations?',
    answer:
      'Prohibited products, misleading claims in titles, missing images, and used items sold as new. Read the seller policies before listing a new product.',
  },
  {
    id: 'faq-18',
    category: 'policies',
    question: 'What happens if I get an IP complaint?',
    answer:
      'You\'ll receive a notification. Provide documentation showing you have rights to the product (invoices, brand authorization). Retaliating against the complainant is a separate violation.',
  },
  {
    id: 'faq-19',
    category: 'policies',
    question: 'Can I sell restricted products?',
    answer:
      'Some categories (medical devices, hazardous materials, firearms) require prior approval. Apply through the category\'s approval workflow before listing.',
  },
  {
    id: 'faq-20',
    category: 'account',
    question: 'How do I close my seller account?',
    answer:
      'Go to Settings → Account Information → Close Account. All open orders must be fulfilled first. Pending payouts are still processed after closure.',
  },
]

export function searchFaqs(query, category) {
  const q = (query || '').trim().toLowerCase()
  return FAQS.filter((f) => {
    if (category && f.category !== category) return false
    if (!q) return true
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q)
    )
  })
}