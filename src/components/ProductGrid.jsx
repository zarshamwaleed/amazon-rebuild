import ProductCard from './ProductCard'
import LoadingSkeleton from './LoadingSkeleton'
import Reveal from './home/Reveal'

export default function ProductGrid({ products = [], cols = 4, loading = false }) {
  const colClass =
    cols === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : cols === 5
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  if (loading) return <LoadingSkeleton count={cols * 2} cols={cols} />
  if (!products.length) return null

  return (
    <div className={'grid gap-x-5 gap-y-8 ' + colClass}>
      {products.map((p, i) => (
        <Reveal key={p.id} variant="up" delay={Math.min(i, 7) * 40}>
          <ProductCard product={p} />
        </Reveal>
      ))}
    </div>
  )
}
