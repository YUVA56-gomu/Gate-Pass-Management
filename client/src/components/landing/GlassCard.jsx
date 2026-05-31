/**
 * Reusable Glass Card Component
 * Premium glassmorphism with backdrop blur and soft shadows
 */
export const GlassCard = ({ children, className = '', hover = true, size = 'md', glow = false }) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`
        backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl
        ${sizeClasses[size]}
        ${hover ? 'hover:shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105' : ''}
        ${glow ? 'animate-glass-glow' : 'shadow-lg'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default GlassCard
