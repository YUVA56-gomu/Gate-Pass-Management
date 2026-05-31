import React from 'react'
import { GlassCard } from './GlassCard'

export const WhyChooseSection = () => {
  const reasons = [
    {
      icon: '📄',
      title: 'Paperless Process',
      description: 'Eliminate paper-based gate passes. Manage everything digitally with secure QR codes and instant verification.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🔐',
      title: 'Secure QR Verification',
      description: 'Advanced QR code technology ensures secure, tamper-proof verification at every gate checkpoint.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '⚡',
      title: 'Fast Multi-Level Approval',
      description: 'Streamlined approval workflow with coordinator and hostel staff verification in real-time.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '📍',
      title: 'Complete Movement Tracking',
      description: 'Real-time tracking of student movement with comprehensive logs and analytics for security.',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            Why Choose This System
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for modern universities with security, efficiency, and ease of use in mind
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <GlassCard
              key={index}
              hover
              size="lg"
              className="flex flex-col animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon Background */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${reason.color} flex items-center justify-center text-3xl mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300`}>
                {reason.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                {reason.description}
              </p>

              {/* Bottom accent */}
              <div className={`mt-6 h-1 w-12 bg-gradient-to-r ${reason.color} rounded-full group-hover:w-full transition-all duration-300`}></div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseSection
