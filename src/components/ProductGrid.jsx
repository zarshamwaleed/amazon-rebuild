import ProductCard from './ProductCard'

export default function ProductGrid({ products = [], cols = 4 }) {
  if (!products.length) return null
  const colClass =
    cols === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : cols === 5
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  return (
    <div className={'grid gap-4 ' + colClass}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
