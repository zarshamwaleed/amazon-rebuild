import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  PackageX,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerProducts,
  deleteSellerProduct,
  duplicateSellerProduct,
  updateSellerProduct,
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

export default function SellerProducts() {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(null) // { id, top, right }
  const tableWrapRef = useRef(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerProducts(user.id)
      setProducts(data)
    } catch {
      pushToast('Could not load products', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  // Close menu when clicking anywhere else or scrolling
  useEffect(() => {
    if (!menu) return
    function close() {
      setMenu(null)
    }
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [menu])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
    )
  }, [products, query])

  function openMenu(e, product) {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenu({
      id: product.id,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
      product,
    })
  }

  async function handleDelete(p) {
    if (!confirm('Delete "' + p.title + '"? This cannot be undone.')) return
    try {
      await deleteSellerProduct(user.id, p.id)
      pushToast('Product deleted', { type: 'info' })
      load()
    } catch {
      pushToast('Could not delete product', { type: 'error' })
    }
  }

  async function handleDuplicate(p) {
    try {
      await duplicateSellerProduct(user.id, p)
      pushToast('Product duplicated', { type: 'success' })
      load()
    } catch {
      pushToast('Could not duplicate product', { type: 'error' })
    }
  }

  async function handleToggleStatus(p) {
    const active = p.is_active !== false
    try {
      await updateSellerProduct(user.id, p.id, { is_active: !active })
      load()
      pushToast(!active ? 'Product activated' : 'Product deactivated', { type: 'info' })
    } catch {
      pushToast('Could not update status', { type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Manage Products"
        description={`${products.length} product${products.length !== 1 ? 's' : ''} in your catalog`}
        actions={
          <Button onClick={() => navigate('/seller/products/new')}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        }
      />

      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your products by title or brand…"
          className="flex-1 text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden" ref={tableWrapRef}>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-2">
            <EmptyState
              icon={PackageX}
              title={query ? 'No products match your search' : 'No products yet'}
              message={
                query
                  ? 'Try a different keyword.'
                  : 'Add your first product to start selling on Avenzo.'
              }
              action={
                !query && (
                  <Button onClick={() => navigate('/seller/products/new')}>
                    <Plus className="w-4 h-4" /> Add your first product
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Product</th>
                  <th className="text-label text-left px-4 py-3">SKU</th>
                  <th className="text-label text-right px-4 py-3">Price</th>
                  <th className="text-label text-right px-4 py-3">Inventory</th>
                  <th className="text-label text-center px-4 py-3">Status</th>
                  <th className="text-label text-right px-4 py-3">Sales</th>
                  <th className="text-label text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => {
                  const inStock = (p.stock || 0) > 0
                  const active = p.is_active !== false && inStock
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-avenzo">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                              <PackageX className="w-4 h-4 text-charcoal-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal-900 truncate max-w-xs">
                              {p.title}
                            </div>
                            {p.brand && <div className="text-xs text-charcoal-500">{p.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-500 font-mono text-xs">
                        {p.sku || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-charcoal-900">
                        ${Number(p.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={inStock ? 'text-charcoal-900' : 'text-error-700'}>
                          {p.stock || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge color={active ? 'green' : 'gray'}>
                          {active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-charcoal-500">0</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => openMenu(e, p)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-charcoal-600" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fixed-position dropdown — never clipped by table overflow */}
      {menu && (
        <div
          className="fixed bg-bone-50 shadow-popover border border-stone-200 rounded-xl z-50 py-1 w-44 overflow-hidden animate-scale-in origin-top-right"
          style={{ top: menu.top, right: menu.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/seller/products/${menu.product.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-100 transition-avenzo"
            onClick={() => setMenu(null)}
          >
            <Edit className="w-4 h-4 text-charcoal-400" /> Edit
          </Link>
          <Link
            to={`/products/${menu.product.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-100 transition-avenzo"
            onClick={() => setMenu(null)}
          >
            <Eye className="w-4 h-4 text-charcoal-400" /> View on Avenzo
          </Link>
          <button
            onClick={() => {
              setMenu(null)
              handleDuplicate(menu.product)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-100 transition-avenzo"
          >
            <Copy className="w-4 h-4 text-charcoal-400" /> Duplicate
          </button>
          <button
            onClick={() => {
              setMenu(null)
              handleToggleStatus(menu.product)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-100 transition-avenzo"
          >
            <PackageX className="w-4 h-4 text-charcoal-400" />{' '}
            {menu.product.is_active !== false ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => {
              setMenu(null)
              handleDelete(menu.product)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-700 hover:bg-error-50 border-t border-stone-200 mt-1 pt-2 transition-avenzo"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
