import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import Category from './pages/Category'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<Placeholder title="Product Details" />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<Placeholder title="Cart" />} />
            <Route path="/checkout" element={<Placeholder title="Checkout" />} />
            <Route path="/login" element={<Placeholder title="Login" />} />
            <Route path="/register" element={<Placeholder title="Register" />} />
            <Route path="/account" element={<Placeholder title="Account" />} />
            <Route path="/orders" element={<Placeholder title="Orders" />} />
            <Route path="/orders/:id" element={<Placeholder title="Order Details" />} />
            <Route path="/wishlist" element={<Placeholder title="Wishlist" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
