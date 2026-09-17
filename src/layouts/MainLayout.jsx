import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import CategoryNav from '../components/CategoryNav'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CategoryNav />
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
