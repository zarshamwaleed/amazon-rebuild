import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/header/Header'
import Footer from '../components/Footer'
import AlexaFloatingButton from '../components/AlexaFloatingButton'
import AlexaDrawer from '../components/AlexaDrawer'

export default function MainLayout() {
  const { pathname } = useLocation()
  const [alexaOpen, setAlexaOpen] = useState(false)

  const hideAlexaDrawer =
    pathname === '/alexa-shopping' ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/sell')

  return (
    <div className="min-h-screen flex flex-col bg-bone-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-bone-50 focus:text-charcoal-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-popover"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className="flex-1 max-w-[1500px] w-full mx-auto px-3 sm:px-4 py-6"
      >
        <Outlet />
      </main>
      <Footer />
      <AlexaFloatingButton onOpen={() => setAlexaOpen(true)} hidden={alexaOpen} />
      {!hideAlexaDrawer && (
        <AlexaDrawer open={alexaOpen} onClose={() => setAlexaOpen(false)} />
      )}
    </div>
  )
}
