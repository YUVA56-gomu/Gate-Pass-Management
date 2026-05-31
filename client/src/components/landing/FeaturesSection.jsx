import GlassCard from './GlassCard'
import { BubbleDecorations } from './BubbleDecorations'

/**
 * Features Section Component
 * Displays premium features with glassmorphism
 */
export const FeaturesSection = () => {
  const features = [
    {
      icon: '📱',
      title: 'Digital Gate Passes',
      description: 'Generate and manage digital passes with unique identifiers for each student.'
    },
    {
      icon: '✅',
      title: 'Multi-Level Approval',
      description: 'Streamlined approval workflow with coordinator and hostel staff verification.'
    },
    {
      icon: '📲',
      title: 'QR Verification',
      description: 'Secure QR code scanning for instant pass verification at gates.'
    },
    {
      icon: '📄',
      title: 'PDF Generation',
      description: 'Download passes as PDF documents for offline access and printing.'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Real-time notifications for pass approvals, rejections, and updates.'
    },
    {
      icon: '📊',
      title: 'Gate Log Tracking',
      description: 'Comprehensive logs of all student entries and exits for security.'
    },
    {
      icon: '📈',
      title: 'Reports & Analytics',
      description: 'Detailed reports on pass usage, student movement, and system statistics.'
    },
    {
      icon: '👥',
      title: 'User Management',
      description: 'Admin panel for managing users, roles, and system configurations.'
    }
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/20 to-white relative overflow-hidden">
      {/* Bubble Decorations */}
      <BubbleDecorations variant="section" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Premium Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for secure and efficient student management
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              hover
              size="md"
              className="flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
