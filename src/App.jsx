import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './layouts/MainLayout'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CouponsProvider } from './context/CouponsContext'
import SellerReports from './pages/seller/SellerReports'
import SellerPayments from './pages/seller/SellerPayments'
import Appstore from './pages/seller/apps/Appstore'
import AppDetail from './pages/seller/apps/AppDetail'
import SellerAccountHealth from './pages/seller/SellerAccountHealth'
import SellerNotifications from './pages/seller/SellerNotifications'
import AppsLanding from './pages/seller/apps/AppsLanding'
import PublicSeller from './pages/PublicSeller'
import SellerReviews from './pages/seller/SellerReviews'
import SellerUsers from './pages/seller/SellerUsers'
import SellerMessages from './pages/seller/SellerMessages'
import CustomerMessages from './pages/CustomerMessages'
import SellerSupport from './pages/seller/SellerSupport'
import SellerSettings from './pages/seller/SellerSettings'
// Seller Central
import SellerLayout from './components/seller/SellerLayout'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerPlaceholder from './pages/seller/SellerPlaceholder'
import SellerProducts from './pages/seller/SellerProducts'
import SellerProductEditor from './pages/seller/SellerProductEditor'
import SellerInventory from './pages/seller/SellerInventory'
import SellerOrders from './pages/seller/SellerOrders'
import SellerOrderDetail from './pages/seller/SellerOrderDetail'
import SellerFulfillment from './pages/seller/SellerFulfillment'
import SellerPricing from './pages/seller/SellerPricing'
import SellerAutomatePricing from './pages/seller/SellerAutomatePricing'
import SellerCoupons from './pages/seller/SellerCoupons'
import SellerDeals from './pages/seller/SellerDeals'
import SellerAdvertising from './pages/seller/SellerAdvertising'
import SellerStore from './pages/seller/SellerStore'
import SellerStoreBuilder from './pages/seller/SellerStoreBuilder'
import PublicStore from './pages/PublicStore'

// Sell on Amazon — separate layout
import SellLayout from './components/sell/SellLayout'
import SellLanding from './pages/sell/SellLanding'
import SellRegister from './pages/sell/SellRegister'

// Prime Video
import PVLayout from './pages/prime-video/PVLayout'
import PVHome from './pages/prime-video/PVHome'
import PVMovies from './pages/prime-video/PVMovies'
import PVTV from './pages/prime-video/PVTV'
import PVMyStuff from './pages/prime-video/PVMyStuff'
import PVSearch from './pages/prime-video/PVSearch'
import PVWatch from './pages/prime-video/PVWatch'
import PVSimple from './pages/prime-video/PVSimple'

// Amazon storefront
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
                    {/* ============ Sell on Amazon — own layout ============ */}
                    <Route path="/sell" element={<SellLayout />}>
                      <Route index element={<SellLanding />} />
                      <Route path="register" element={<SellRegister />} />
                    </Route>

                    {/* ============ Seller Central ============ */}
                    <Route path="/seller" element={<SellerLayout />}>
                      <Route index element={<SellerDashboard />} />
                      <Route path="messages" element={<SellerMessages />} />
                      <Route path="help" element={<SellerSupport />} />
                      <Route path="notifications" element={<SellerNotifications />} />
                      <Route path="apps-services" element={<AppsLanding />} />

                      <Route path="apps-services/appstore" element={<Appstore />} />
<Route path="apps-services/app/:id" element={<AppDetail />} />

                      {/* Catalog / Products */}
                      <Route path="products" element={<SellerProducts />} />
                      <Route path="products/new" element={<SellerProductEditor />} />
                      <Route path="products/:id/edit" element={<SellerProductEditor />} />

                      {/* Inventory */}
                      <Route path="inventory" element={<SellerInventory />} />
                      <Route path="inventory/fba" element={<SellerPlaceholder title="FBA Inventory" />} />

                      {/* Orders */}
                      <Route path="orders" element={<SellerOrders />} />
                      <Route path="orders/returns" element={<SellerPlaceholder title="Returns" />} />
                      <Route path="orders/:id" element={<SellerOrderDetail />} />

                      {/* Fulfillment */}
                      <Route path="fulfillment" element={<SellerFulfillment />} />

                      {/* Pricing */}
                      <Route path="pricing" element={<SellerPricing />} />
                      <Route path="pricing/automate" element={<SellerAutomatePricing />} />

                      {/* Advertising / Coupons / Deals */}
                      <Route path="advertising" element={<SellerAdvertising />} />
                      <Route path="coupons" element={<SellerCoupons />} />
                      <Route path="deals" element={<SellerDeals />} />
                      <Route path="reviews" element={<SellerReviews />} />
                      

                      {/* Brand Store */}
                      <Route path="store" element={<SellerStore />} />
                      <Route path="store/builder" element={<SellerStoreBuilder />} />

                      {/* Placeholder pages for later modules */}
                      <Route path="growth" element={<SellerPlaceholder title="Growth" />} />
                      <Route path="reports" element={<SellerReports />} />
                      <Route path="payments" element={<SellerPayments />} />
                      <Route path="account-health" element={<SellerAccountHealth />} />
                      <Route path="customers" element={<SellerPlaceholder title="Customers" />} />
                      <Route path="apps" element={<SellerPlaceholder title="Apps & Services" />} />
                      <Route path="settings/users" element={<SellerUsers />} />
                      <Route path="settings" element={<SellerSettings />} />
                    </Route>

                    {/* ============ Amazon storefront — main layout ============ */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetails />} />
                      <Route path="/category/:slug" element={<Category />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/store/:slug" element={<PublicStore />} />
                      <Route path="/seller/:id" element={<PublicSeller />} />

                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route
  path="/messages"
  element={<ProtectedRoute><CustomerMessages /></ProtectedRoute>}
/>
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

                      {/* Prime Video — nested so Amazon header stays on top */}
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