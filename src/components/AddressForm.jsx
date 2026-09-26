import { useState } from 'react'
import Input from './Input'
import Button from './Button'

export default function AddressForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save address' }) {
  const [fullName, setFullName] = useState(initial.full_name || '')
  const [phone, setPhone] = useState(initial.phone || '')
  const [addressLine, setAddressLine] = useState(initial.address_line || '')
  const [city, setCity] = useState(initial.city || '')
  const [postalCode, setPostalCode] = useState(initial.postal_code || '')
  const [country, setCountry] = useState(initial.country || 'Pakistan')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const nextFieldErrors = {}
    if (!fullName.trim()) nextFieldErrors.fullName = 'Full name is required'
    if (!addressLine.trim()) nextFieldErrors.addressLine = 'Address is required'
    if (!city.trim()) nextFieldErrors.city = 'City is required'
    if (!country.trim()) nextFieldErrors.country = 'Country is required'
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    setSaving(true)
    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address_line: addressLine.trim(),
        city: city.trim(),
        postal_code: postalCode.trim() || null,
        country: country.trim(),
      })
    } catch (err) {
      setError(err.message || 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
          required
        />
        <Input
          label="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+92 300 1234567"
        />
      </div>
      <Input
        label="Address"
        value={addressLine}
        onChange={(e) => setAddressLine(e.target.value)}
        placeholder="Street, building, apartment"
        error={fieldErrors.addressLine}
        required
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={fieldErrors.city}
          required
        />
        <Input label="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
      </div>
      <Input
        label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        error={fieldErrors.country}
        required
      />
      {error && (
        <div className="text-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3 animate-fade-in">
          {error}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="secondary" loading={saving}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
