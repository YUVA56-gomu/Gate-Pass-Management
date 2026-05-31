import React from 'react'
import { BubbleDecorations } from './BubbleDecorations'

export const WorkflowSection = () => {
  const steps = [
    {
      number: 1,
      title: 'Student Apply',
      description: 'Student applies for daily pass or long leave',
      icon: '👨‍🎓',
      color: 'from-blue-400 to-blue-600'
    },
    {
      number: 2,
      title: 'Coordinator Approval',
      description: 'Coordinator verifies and approves request',
      icon: '👔',
      color: 'from-purple-400 to-purple-600'
    },
    {
      number: 3,
      title: 'Hostel Approval',
      description: 'Hostel staff confirms hostel status',
      icon: '🏢',
      color: 'from-pink-400 to-pink-600'
    },
    {
      number: 4,
      title: 'QR Pass Generated',
      description: 'Digital pass with unique QR code created',
      icon: '📱',
      color: 'from-green-400 to-green-600'
    },
    {
      number: 5,
      title: 'Security Verification',
      description: 'Security scans QR at gate entry/exit',
      icon: '🔐',
      color: 'from-orange-400 to-orange-600'
    },
    {
      number: 6,
      title: 'Gate Log Recorded',
      description: 'Entry/exit logged in system',
      icon: '📊',
      color: 'from-red-400 to-red-600'
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Bubble Decorations */}
      <BubbleDecorations variant="light" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Simple, Secure & Seamless
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Workflow
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Six simple steps from application to verification
          </p>
        </div>

        {/* Horizontal Timeline - Desktop */}
        <div className="hidden md:block overflow-x-auto pb-8">
          <div className="relative min-w-max px-4">
            {/* Connection Line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400"></div>

            {/* Steps Container */}
            <div className="flex gap-8 justify-center items-start">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center relative animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Bubble */}
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${step.color} flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer relative z-20 mb-6`}>
                    <div className="text-4xl mb-1">{step.icon}</div>
                    <div className="text-xs font-semibold text-white">{step.title}</div>
                  </div>

                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full border-3 border-gray-900 flex items-center justify-center font-semibold text-sm text-gray-900 shadow-lg">
                    {step.number}
                  </div>

                  {/* Description */}
                  <div className="text-center mt-4 w-32">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow Animation */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-10 top-12 text-2xl text-gray-400 animate-bounce-slow">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                {/* Bubble */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl shadow-lg relative`}>
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border-2 border-gray-900 flex items-center justify-center font-bold text-xs text-gray-900">
                    {step.number}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-transparent mt-2 animate-pulse"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkflowSection
