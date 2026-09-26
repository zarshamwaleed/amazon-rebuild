import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoginForm from '../components/LoginForm'
import AuthSplitLayout from '../components/auth/AuthSplitLayout'
import { useAuth } from '../context/AuthContext'

const IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'

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
    <AuthSplitLayout
      eyebrow="Welcome Back"
      heading="Your considered edit, right where you left it."
      quote="Good design is a quiet luxury — it should never announce itself."
      quoteAttribution="The Avenzo Journal"
      image={IMAGE}
    >
      <h1 className="heading-page">Sign in</h1>
      <p className="text-body-sm mt-2 mb-9">Welcome back to Avenzo.</p>
      <LoginForm onSuccess={() => navigate(location.state?.from || '/', { replace: true })} />
    </AuthSplitLayout>
  )
}
