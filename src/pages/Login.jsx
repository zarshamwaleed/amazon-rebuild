import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoginForm from '../components/LoginForm'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth()

  // Redirect signed-in users away from /login
  useEffect(() => {
    if (!loading && user) {
      navigate(location.state?.from || '/', { replace: true })
    }
  }, [user, loading, navigate, location.state])

  if (!loading && user) return <Navigate to={location.state?.from || '/'} replace />

  return (
    <div className="max-w-sm mx-auto py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-600">Welcome back to Amazon Rebuild</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <LoginForm onSuccess={() => navigate(location.state?.from || '/', { replace: true })} />
      </div>
    </div>
  )
}
