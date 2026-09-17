import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './layouts/MainLayout'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Home from './pages/Home'
import Products from './pages/Products'
import Category from './pages/Category'
import SearchResults from './pages/SearchResults'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import InfoPage from './pages/InfoPage'
import CustomerService from './pages/CustomerService'
import GiftCards from './pages/GiftCards'
import Registry from './pages/Registry'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/category/:slug" element={<Category />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/cart" element={<Cart />} />

                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

                    <Route path="/wishlist" element={<Wishlist />} />

                    {/* Info & supporting pages */}
                    <Route path="/about" element={<InfoPage />} />
                    <Route path="/careers" element={<InfoPage />} />
                    <Route path="/press" element={<InfoPage />} />
                    <Route path="/investor-relations" element={<InfoPage />} />
                    <Route path="/sustainability" element={<InfoPage />} />
                    <Route path="/accessibility" element={<InfoPage />} />

                    <Route path="/customer-service" element={<CustomerService />} />
                    <Route path="/gift-cards" element={<GiftCards />} />
                    <Route path="/registry" element={<Registry />} />

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
