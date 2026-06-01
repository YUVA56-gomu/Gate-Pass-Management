import { useAuth } from '../../hooks/useAuth'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'

function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-slate-800 font-medium text-sm border border-slate-100">
        {value || <span className="text-slate-400 font-normal">Not set</span>}
      </div>
    </div>
  )
}

export function Profile() {
  const { user } = useAuth()

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <PageHeader title="My Profile" subtitle="Your account information and responsibilities" />

        {/* Profile Banner */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white mb-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'H'}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user?.name || 'Hostel Staff'}</h2>
              <p className="text-emerald-100 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">Hostel Staff</span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" />Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Account Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Full Name"      value={user?.name} />
            <InfoField label="Email Address"  value={user?.email} />
            <InfoField label="Role"           value="Hostel Staff" />
            <InfoField label="Status"         value="Active" />
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Responsibilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { color: 'bg-blue-50 border-blue-100',   icon: 'text-blue-600',   bg: 'bg-blue-100',   title: 'Pass Approval',         desc: 'Review and approve student gate pass requests' },
              { color: 'bg-violet-50 border-violet-100', icon: 'text-violet-600', bg: 'bg-violet-100', title: 'Student Management',    desc: 'Monitor student movements and hostel records' },
              { color: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600', bg: 'bg-emerald-100', title: 'Leave Tracking',   desc: 'Track student leave dates and return schedules' },
              { color: 'bg-amber-50 border-amber-100', icon: 'text-amber-600',   bg: 'bg-amber-100',  title: 'Security Coordination', desc: 'Coordinate with security for student safety' },
            ].map(item => (
              <div key={item.title} className={`flex items-start gap-3 p-4 rounded-xl border ${item.color}`}>
                <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-4 h-4 ${item.icon}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

export default Profile
