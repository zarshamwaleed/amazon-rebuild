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
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) return setError('Full name is required')
    if (!addressLine.trim()) return setError('Address is required')
    if (!city.trim()) return setError('City is required')
    if (!country.trim()) return setError('Country is required')

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        label="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+92 300 1234567"
      />
      <Input
        label="Address"
        value={addressLine}
        onChange={(e) => setAddressLine(e.target.value)}
        placeholder="Street, building, apartment"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input
          label="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>
      <Input
        label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
      />
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="secondary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
