import { useState } from 'react'
import HeaderSearch from './HeaderSearch'
import HeaderNav from './HeaderNav'
import AllMenu from './AllMenu'

export default function Header() {
  const [allOpen, setAllOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40">
        <HeaderSearch />
        <HeaderNav onOpenAll={() => setAllOpen(true)} />
      </header>
      <AllMenu open={allOpen} onClose={() => setAllOpen(false)} />
    </>
  )
}
