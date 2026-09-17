import Badge from './Badge'

const MAP = {
  order_placed: { label: 'Order Placed', color: 'blue' },
  processing: { label: 'Processing', color: 'yellow' },
  shipped: { label: 'Shipped', color: 'blue' },
  out_for_delivery: { label: 'Out for Delivery', color: 'yellow' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
}

export default function OrderStatusBadge({ status }) {
  const s = MAP[status] || { label: status, color: 'gray' }
  return <Badge color={s.color}>{s.label}</Badge>
}
