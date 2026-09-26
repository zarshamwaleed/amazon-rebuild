import AccountSidebar from '../components/AccountSidebar'
import ProfileForm from '../components/ProfileForm'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user, profile } = useAuth()
  const firstName = (profile?.full_name || '').trim().split(' ')[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-page">{firstName ? `Welcome back, ${firstName}` : 'Your Account'}</h1>
        <p className="text-body-sm mt-1.5">Manage your profile, orders, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 min-w-0 bg-bone-50 border border-stone-200 rounded-xl p-6 sm:p-8">
          <h2 className="heading-section mb-1">Profile</h2>
          <p className="text-body-sm mb-8">
            Signed in as{' '}
            <span className="font-medium text-charcoal-800">{profile?.email || user?.email}</span>
          </p>
          <ProfileForm />
        </div>
      </div>
    </div>
  )
}
