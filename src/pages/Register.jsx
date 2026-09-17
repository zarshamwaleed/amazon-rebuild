import { useNavigate, Navigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <div className="max-w-sm mx-auto py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-600">Join Amazon Rebuild today</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
      </div>
    </div>
  )
}
