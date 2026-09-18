import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './layouts/MainLayout'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CouponsProvider } from './context/CouponsContext'

// Sell on Amazon — separate layout
import SellLayout from './components/sell/SellLayout'
import SellLanding from './pages/sell/SellLanding'
import SellRegister from './pages/sell/SellRegister'

// Prime Video — separate layout
import PVLayout from './pages/prime-video/PVLayout'
import PVHome from './pages/prime-video/PVHome'
import PVMovies from './pages/prime-video/PVMovies'
import PVTV from './pages/prime-video/PVTV'
import PVMyStuff from './pages/prime-video/PVMyStuff'
import PVSearch from './pages/prime-video/PVSearch'
import PVWatch from './pages/prime-video/PVWatch'
import PVSimple from './pages/prime-video/PVSimple'

// Amazon storefront pages
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
import AlexaShopping from './pages/AlexaShopping'
import Coupons from './pages/Coupons'
import MyCoupons from './pages/MyCoupons'
import BrowsingHistory from './pages/BrowsingHistory'
import Deals from './pages/Deals'
import BuyAgain from './pages/BuyAgain'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CouponsProvider>
            <WishlistProvider>
              <CartProvider>
                <BrowserRouter>
                  <Routes>
                    {/* ============ Sell on Amazon — own layout, no Amazon header ============ */}
                    <Route path="/sell" element={<SellLayout />}>
                      <Route index element={<SellLanding />} />
                      <Route path="register" element={<SellRegister />} />
                    </Route>

                    {/* ============ Prime Video — own layout, no Amazon header ============ */}
                    <Route path="/prime-video" element={<PVLayout />}>
                      <Route index element={<PVHome />} />
                      <Route path="movies" element={<PVMovies />} />
                      <Route path="tv" element={<PVTV />} />
                      <Route path="my-stuff" element={<PVMyStuff />} />
                      <Route path="search" element={<PVSearch />} />
                      <Route path="watch/:id" element={<PVWatch />} />
                      <Route path="sports" element={<PVSimple />} />
                      <Route path="live" element={<PVSimple />} />
                      <Route path="subscriptions" element={<PVSimple />} />
                      <Route path="categories" element={<PVSimple />} />
                    </Route>

                    {/* ============ Amazon storefront — main layout ============ */}
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

                      <Route path="/alexa-shopping" element={<AlexaShopping />} />
                      <Route path="/coupons" element={<Coupons />} />
                      <Route path="/coupons/my-coupons" element={<MyCoupons />} />
                      <Route path="/browsing-history" element={<BrowsingHistory />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/buy-again" element={<BuyAgain />} />

                      <Route path="/customer-service" element={<CustomerService />} />
                      <Route path="/gift-cards" element={<GiftCards />} />
                      <Route path="/registry" element={<Registry />} />

                      <Route path="/about" element={<InfoPage />} />
                      <Route path="/careers" element={<InfoPage />} />
                      <Route path="/press" element={<InfoPage />} />
                      <Route path="/investor-relations" element={<InfoPage />} />
                      <Route path="/sustainability" element={<InfoPage />} />
                      <Route path="/accessibility" element={<InfoPage />} />

                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </WishlistProvider>
          </CouponsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}