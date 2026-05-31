import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from './GlassCard'
import { BubbleDecorations } from './BubbleDecorations'

export const PortalCards = () => {
  const portals = [
    {
      title: 'Student Portal',
      description: 'Apply for gate passes, track approvals, and manage your leave requests',
      capabilities: ['Apply Passes', 'Track Status', 'Download QR', 'View History'],
      icon: '👨‍🎓',
      color: 'from-blue-400 to-blue-600',
      borderColor: 'from-blue-400/50 to-blue-600/50'
    },
    {
      title: 'Coordinator Portal',
      description: 'Review and approve student pass requests with detailed tracking',
      capabilities: ['Review Requests', 'Approve/Reject', 'View History', 'Analytics'],
      icon: '👔',
      color: 'from-purple-400 to-purple-600',
      borderColor: 'from-purple-400/50 to-purple-600/50'
    },
    {
      title: 'Hostel Portal',
      description: 'Manage hostel approvals and student information',
      capabilities: ['Approve Passes', 'Manage Students', 'View Requests', 'Reports'],
      icon: '🏢',
      color: 'from-green-400 to-green-600',
      borderColor: 'from-green-400/50 to-green-600/50'
    },
    {
      title: 'Security Portal',
      description: 'Scan QR codes and verify student gate passes in real-time',
      capabilities: ['Scan QR', 'Verify Pass', 'View Logs', 'Statistics'],
      icon: '🔐',
      color: 'from-red-400 to-red-600',
      borderColor: 'from-red-400/50 to-red-600/50'
    },
    {
      title: 'Admin Portal',
      description: 'System administration and comprehensive reporting',
      capabilities: ['Manage Users', 'View Reports', 'Settings', 'Activity Logs'],
      icon: '⚙️',
      color: 'from-orange-400 to-orange-600',
      borderColor: 'from-orange-400/50 to-orange-600/50'
    }
  ]

  return (
    <section
    id="portals"
    className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/20 to-white relative overflow-hidden">
      {/* Bubble Decorations */}
      <BubbleDecorations variant="section" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Designed for
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Every Role
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Premium portal access for each role in the system
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {portals.map((portal, index) => (
            <GlassCard
              key={index}
              className="flex flex-col h-full group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-1">
                {/* Icon Background */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center text-4xl mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300`}>
                  {portal.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {portal.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {portal.description}
                </p>

                {/* Capabilities */}
                <div className="space-y-2 mb-6">
                  {portal.capabilities.map((capability, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <span className={`w-1.5 h-1.5 bg-gradient-to-r ${portal.color} rounded-full mr-2 flex-shrink-0`}></span>
                      {capability}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${portal.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

              {/* Access Button */}
              <Link
                to="/login"
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-center transition-all duration-300 bg-gradient-to-r ${portal.color} hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 relative z-10 group-hover:translate-y-0`}
              >
                Access Portal →
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PortalCards
