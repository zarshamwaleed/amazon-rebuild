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
    const menuWidth = 180
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''} in your catalog
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your products by title or brand..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg" ref={tableWrapRef}>
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">Loading products…</div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => navigate('/seller/products/new')} hasQuery={query.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">Inventory</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Sales</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const inStock = (p.stock || 0) > 0
                  const active = p.is_active !== false && inStock
                  return (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <PackageX className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {p.title}
                            </div>
                            {p.brand && <div className="text-xs text-gray-500">{p.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {p.sku || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${Number(p.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={inStock ? 'text-gray-900' : 'text-red-600'}>
                          {p.stock || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            'inline-block text-xs font-medium px-2 py-0.5 rounded-full ' +
                            (active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')
                          }
                        >
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">0</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => openMenu(e, p)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
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
          className="fixed bg-white shadow-lg border border-gray-200 rounded z-50 py-1 w-44"
          style={{ top: menu.top, right: menu.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/seller/products/${menu.product.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setMenu(null)}
          >
            <Edit className="w-4 h-4 text-gray-500" /> Edit
          </Link>
          <Link
            to={`/products/${menu.product.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setMenu(null)}
          >
            <Eye className="w-4 h-4 text-gray-500" /> View on Amazon
          </Link>
          <button
            onClick={() => {
              setMenu(null)
              handleDuplicate(menu.product)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <Copy className="w-4 h-4 text-gray-500" /> Duplicate
          </button>
          <button
            onClick={() => {
              setMenu(null)
              handleToggleStatus(menu.product)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <PackageX className="w-4 h-4 text-gray-500" />{' '}
            {menu.product.is_active !== false ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => {
              setMenu(null)
              handleDelete(menu.product)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 border-t mt-1 pt-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onAdd, hasQuery }) {
  return (
    <div className="p-12 text-center">
      <PackageX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      {hasQuery ? (
        <>
          <h3 className="font-semibold text-gray-900 mb-1">No products match your search</h3>
          <p className="text-sm text-gray-600">Try a different keyword.</p>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-gray-900 mb-1">No products yet</h3>
          <p className="text-sm text-gray-600 mb-5">
            Add your first product to start selling on Amazon Rebuild.
          </p>
          <button
            onClick={onAdd}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add your first product
          </button>
        </>
      )}
    </div>
  )
}