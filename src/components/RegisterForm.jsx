import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import { useAuth } from '../context/AuthContext'

export default function RegisterForm({ onSuccess }) {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const errors = {}
    if (password.length < 6) errors.password = 'Use at least 6 characters'
    if (password !== confirm) errors.confirm = 'Passwords do not match'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      await signUp({ email, password, fullName })
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.message || 'We could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Full name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        autoComplete="name"
        placeholder="Jane Doe"
      />
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
        onChange={(e) => {
          setPassword(e.target.value)
          if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: null }))
        }}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        hint="At least 6 characters"
        error={fieldErrors.password}
      />
      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value)
          if (fieldErrors.confirm) setFieldErrors((f) => ({ ...f, confirm: null }))
        }}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        error={fieldErrors.confirm}
      />

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-error-500/30 bg-error-50 px-3.5 py-3 text-sm text-error-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? 'Creating your account…' : 'Create account'}
      </Button>

      <p className="text-caption text-center">
        By creating an account, you agree to our (fictional) Terms of Service.
      </p>
      <p className="text-body-sm text-center">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-charcoal-900 hover:text-brass-600 underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
