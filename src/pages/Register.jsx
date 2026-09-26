import { useNavigate, Navigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import AuthSplitLayout from '../components/auth/AuthSplitLayout'
import { useAuth } from '../context/AuthContext'

const IMAGE =
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80'

export default function Register() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <AuthSplitLayout
      eyebrow="Join Avenzo"
      heading="Everyday essentials, rare finds — curated for how you live."
      quote="We built Avenzo for people who'd rather own less, and love it more."
      quoteAttribution="The Avenzo Journal"
      image={IMAGE}
    >
      <h1 className="heading-page">Create your account</h1>
      <p className="text-body-sm mt-2 mb-9">Join Avenzo today.</p>
      <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
    </AuthSplitLayout>
  )
}
