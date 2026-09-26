import { PackageSearch, Clock, Truck, CircleCheck, XCircle, RotateCcw } from 'lucide-react'
import Badge from './Badge'

const MAP = {
  order_placed: { label: 'Order Placed', color: 'blue', icon: PackageSearch },
  processing: { label: 'Processing', color: 'yellow', icon: Clock },
  shipped: { label: 'Shipped', color: 'blue', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'yellow', icon: Truck },
  delivered: { label: 'Delivered', color: 'green', icon: CircleCheck },
  cancelled: { label: 'Cancelled', color: 'red', icon: XCircle },
  refunded: { label: 'Refunded', color: 'red', icon: RotateCcw },
}

export default function OrderStatusBadge({ status }) {
  const s = MAP[status] || { label: status, color: 'gray', icon: PackageSearch }
  const Icon = s.icon
  return (
    <Badge color={s.color}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {s.label}
    </Badge>
  )
}
