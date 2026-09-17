import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto">Amazon Rebuild</div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-300 text-sm px-4 py-4">
        <div className="max-w-7xl mx-auto">© Amazon Rebuild</div>
      </footer>
    </div>
  )
}
