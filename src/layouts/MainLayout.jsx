import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import CategoryNav from '../components/CategoryNav'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded focus:shadow"
      >
        Skip to main content
      </a>
      <Header />
      <CategoryNav />
      <main
        id="main-content"
        className="flex-1 max-w-[1500px] w-full mx-auto px-3 sm:px-4 py-6"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
