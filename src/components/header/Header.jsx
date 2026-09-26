import { useEffect, useState } from 'react'
import DesktopHeader from './DesktopHeader'
import HeaderNav from './HeaderNav'
import MobileHeader from './MobileHeader'
import MobileMenu from './MobileMenu'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={
          'sticky top-0 z-40 bg-bone-50/95 backdrop-blur-sm transition-avenzo border-b ' +
          (scrolled ? 'border-stone-200 shadow-soft' : 'border-transparent')
        }
      >
        <div className="hidden lg:block">
          <DesktopHeader />
          <HeaderNav />
        </div>
        <MobileHeader menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
