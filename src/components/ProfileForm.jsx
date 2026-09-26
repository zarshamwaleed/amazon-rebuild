import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ProfileForm() {
  const { profile, user, updateProfile } = useAuth()
  const { pushToast } = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const dirty = fullName !== (profile?.full_name || '') || phone !== (profile?.phone || '')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!dirty) return
    setError(null)
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName, phone })
      pushToast('Profile updated', { type: 'success' })
    } catch (err) {
      setError(err.message || 'We could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <Input
        label="Full name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Your name"
      />
      <Input
        label="Email address"
        type="email"
        value={user?.email || ''}
        disabled
        hint="Your email is tied to your account and can't be changed here"
      />
      <Input
        label="Phone number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+92 300 1234567"
      />

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-error-500/30 bg-error-50 px-3.5 py-3 text-sm text-error-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={saving} disabled={!dirty}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {!dirty && <span className="text-caption">No changes to save</span>}
      </div>
    </form>
  )
}
