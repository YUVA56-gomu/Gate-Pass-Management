import React from 'react'
import { GlassCard } from './GlassCard'

export const SystemPreview = () => {
  const dashboards = [
    {
      title: 'Student Dashboard',
      description: 'Apply passes, track status, and manage your profile',
      features: ['Quick Actions', 'Pass Statistics', 'Recent Applications', 'Notifications']
    },
    {
      title: 'Coordinator Dashboard',
      description: 'Review and approve student requests efficiently',
      features: ['Pending Requests', 'Approval History', 'Statistics', 'Activity Logs']
    },
    {
      title: 'Hostel Dashboard',
      description: 'Manage hostel approvals and student information',
      features: ['Student Directory', 'Pass Approvals', 'Active Passes', 'Reports']
    },
    {
      title: 'Security Dashboard',
      description: 'Real-time QR scanning and gate verification',
      features: ['QR Scanner', 'Scan Logs', 'Statistics', 'Verification']
    },
    {
      title: 'Admin Dashboard',
      description: 'System administration and comprehensive analytics',
      features: ['User Management', 'Reports', 'Settings', 'Activity Logs']
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            System Preview
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the dashboards designed for each role
          </p>
        </div>

        {/* Preview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {dashboards.map((dashboard, index) => (
            <GlassCard key={index} className="hover:shadow-2xl transition-all duration-300">
              {/* Placeholder Preview */}
              <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-xs text-gray-500">Dashboard Preview</p>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {dashboard.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {dashboard.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {dashboard.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs text-gray-700">
                    <span className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100/50 backdrop-blur-sm">
          <p className="text-center text-gray-700">
            Dashboard screenshots will be displayed here as the system is deployed. Each dashboard is optimized for its specific role and workflow.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SystemPreview
