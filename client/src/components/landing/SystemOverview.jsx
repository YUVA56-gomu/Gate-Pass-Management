import GlassCard from './GlassCard'
import { BubbleDecorations } from './BubbleDecorations'

/**
 * System Overview Component
 * Displays the four main roles with premium glassmorphism
 */
export const SystemOverview = () => {
  const roles = [
    {
      icon: '👨‍🎓',
      title: 'Students',
      description: 'Apply for passes, track approvals, download QR codes, and manage your outpass requests.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '👨‍🏫',
      title: 'Coordinators',
      description: 'Review and approve long leave requests from students with detailed tracking.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🏢',
      title: 'Hostel Staff',
      description: 'Manage daily passes, verify student information, and track hostel residents.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🔐',
      title: 'Security',
      description: 'Scan QR codes, verify passes, and maintain gate entry/exit logs.',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section id="overview" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
      {/* Bubble Decorations */}
      <BubbleDecorations variant="section" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            System Overview
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Designed for every stakeholder in the student management ecosystem
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <GlassCard
              key={index}
              hover
              size="lg"
              className="flex flex-col items-center text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-4xl shadow-lg mb-4`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{role.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">{role.description}</p>
              <div className={`mt-6 w-full h-1 bg-gradient-to-r ${role.color} rounded-full`}></div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SystemOverview
