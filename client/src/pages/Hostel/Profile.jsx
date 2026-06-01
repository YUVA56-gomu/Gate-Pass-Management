import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Profile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/hostel/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1 font-normal">Your account information and responsibilities</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'H'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Hostel Staff'}</h2>
              <p className="text-gray-500 font-normal mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Hostel Staff
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium text-sm border border-gray-100">
                  {user?.name || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium text-sm border border-gray-100">
                  {user?.email || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium text-sm border border-gray-100">
                  Hostel Staff
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Account Status</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Responsibilities Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Responsibilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-100',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  icon: (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ),
                  title: 'Pass Approval',
                  desc: 'Review and approve student gate pass requests'
                },
                {
                  bgColor: 'bg-purple-50',
                  borderColor: 'border-purple-100',
                  iconBg: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  icon: (
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  ),
                  title: 'Student Management',
                  desc: 'Monitor student movements and hostel records'
                },
                {
                  bgColor: 'bg-green-50',
                  borderColor: 'border-green-100',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                  icon: (
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  ),
                  title: 'Leave Tracking',
                  desc: 'Track student leave dates and return schedules'
                },
                {
                  bgColor: 'bg-orange-50',
                  borderColor: 'border-orange-100',
                  iconBg: 'bg-orange-100',
                  iconColor: 'text-orange-600',
                  icon: (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  ),
                  title: 'Security Coordination',
                  desc: 'Coordinate with security for student safety'
                }
              ].map(({ bgColor, borderColor, iconBg, iconColor, icon, title, desc }) => (
                <div key={title} className={`flex items-start gap-3 p-4 ${bgColor} rounded-xl border ${borderColor}`}>
                  <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                      {icon}
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
