import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CategoryHeader from '../components/CategoryHeader'
import SortDropdown from '../components/SortDropdown'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { getCategoryBySlug } from '../services/categoryService'
import { queryProducts } from '../services/productService'

const PAGE_SIZE = 12

export default function Category() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  // Load category + products whenever slug/sort/page change
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const cat = await getCategoryBySlug(slug)
        if (cancelled) return
        if (!cat) {
          setCategory(null)
          setProducts([])
          setTotal(0)
          setLoading(false)
          return
        }
        setCategory(cat)

        const { data, count } = await queryProducts({
          categoryId: cat.id,
          sort,
          page,
          pageSize: PAGE_SIZE,
        })
        if (cancelled) return
        setProducts(data || [])
        setTotal(count || 0)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, sort, page])

  if (!loading && !category) {
    return (
      <EmptyState
        title="Category not found"
        message="The category you tried to open does not exist."
      />
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <CategoryHeader
        title={category?.name || 'Category'}
        count={total}
        description={category?.description}
      />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1) }} />
      </div>

      {loading ? (
        <LoadingSkeleton count={PAGE_SIZE} />
      ) : error ? (
        <EmptyState title="Could not load products" message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in this category"
          message="Check back soon."
        />
      ) : (
        <>
          <ProductGrid products={products} cols={3} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
