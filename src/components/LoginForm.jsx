import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import { useAuth } from '../context/AuthContext'

export default function LoginForm({ onSuccess }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn({ email, password })
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.message || 'We could not sign you in. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-error-500/30 bg-error-50 px-3.5 py-3 text-sm text-error-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-body-sm text-center pt-1">
        New to Avenzo?{' '}
        <Link
          to="/register"
          className="font-medium text-charcoal-900 hover:text-brass-600 underline underline-offset-2"
        >
          Create your account
        </Link>
      </p>
    </form>
  )
}
