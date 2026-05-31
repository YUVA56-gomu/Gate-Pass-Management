import React, { useState, useEffect } from 'react'
import { GlassCard } from './GlassCard'

const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration])

  return <span>{count.toLocaleString()}</span>
}

export const StatisticsSection = () => {
  const stats = [
    {
      label: 'Passes Generated',
      value: 5240,
      icon: '📄',
      color: 'from-blue-400 to-blue-600'
    },
    {
      label: 'Students Registered',
      value: 1850,
      icon: '👥',
      color: 'from-purple-400 to-purple-600'
    },
    {
      label: 'QR Verifications',
      value: 12500,
      icon: '✓',
      color: 'from-green-400 to-green-600'
    },
    {
      label: 'Active Users',
      value: 450,
      icon: '🟢',
      color: 'from-orange-400 to-orange-600'
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-green-50/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            System Statistics
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time metrics from our Smart Gate Pass Management System
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              {/* Icon */}
              <div className="text-5xl mb-4">{stat.icon}</div>

              {/* Counter */}
              <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                <AnimatedCounter target={stat.value} />
              </div>

              {/* Label */}
              <p className="text-gray-600 font-semibold">
                {stat.label}
              </p>

              {/* Trend Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-200/50">
                <p className="text-xs text-green-600 font-semibold">
                  ↑ 12% this month
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="bg-gradient-to-br from-blue-50/50 to-transparent">
            <h3 className="text-lg font-bold text-gray-900 mb-2">System Uptime</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">99.9%</p>
            <p className="text-sm text-gray-600">Reliable and always available</p>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-purple-50/50 to-transparent">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Response Time</h3>
            <p className="text-3xl font-bold text-purple-600 mb-2">&lt;100ms</p>
            <p className="text-sm text-gray-600">Lightning-fast performance</p>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-green-50/50 to-transparent">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Security</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">256-bit</p>
            <p className="text-sm text-gray-600">Enterprise-grade encryption</p>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}

export default StatisticsSection
