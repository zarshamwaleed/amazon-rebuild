import AccountSidebar from '../components/AccountSidebar'
import ProfileForm from '../components/ProfileForm'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user, profile } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Account</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1 bg-white border border-gray-200 rounded-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <p className="text-sm text-gray-600 mb-6">
            Signed in as <strong>{profile?.email || user?.email}</strong>
          </p>
          <ProfileForm />
        </div>
      </div>
    </div>
  )
}
