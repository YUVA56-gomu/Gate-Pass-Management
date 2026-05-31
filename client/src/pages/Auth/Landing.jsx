import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/landing/Navbar'
import { HeroSection } from '../../components/landing/HeroSection'
import { WorkflowSection } from '../../components/landing/WorkflowSection'
import { FeaturesSection } from '../../components/landing/FeaturesSection'
import { PortalCards } from '../../components/landing/PortalCards'
import { Footer } from '../../components/landing/Footer'
import { BubbleDecorations } from '../../components/landing/BubbleDecorations'
import { GlassCard } from '../../components/landing/GlassCard'

/**
 * Landing Page Component
 * Public marketing landing page with all sections
 * Includes: Navigation, Hero, Workflow, Features, Portals, CTA Banner, Footer
 */
export const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Workflow Section */}
      <WorkflowSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Access Portals Section */}
      <PortalCards />

      {/* CTA Banner Section */}
      <CTABannerSection navigate={navigate} />

      {/* Footer */}
      <Footer />
    </div>
  )
}

/**
 * CTA Banner Section Component
 * Blue-purple gradient banner with call-to-action buttons
 */
const CTABannerSection = ({ navigate }) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main Heading */}
        <h2 className="text-5xl md:text-6xl font-semibold text-white mb-6 tracking-tight">
          Ready to Simplify Gate Pass Management?
        </h2>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of institutions using our smart and secure solution for student movement management.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 text-lg group flex items-center justify-center gap-2 min-w-max"
          >
            Get Started Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 text-lg flex items-center justify-center gap-2 min-w-max"
          >
            Login
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Trust Badge */}
        <div className="mt-16 pt-12 border-t border-white/20">
          <p className="text-white/80 text-sm font-medium mb-6">Trusted by leading educational institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="text-white/60 font-semibold">500+ Institutions</div>
            <div className="w-1 h-6 bg-white/30"></div>
            <div className="text-white/60 font-semibold">50K+ Students</div>
            <div className="w-1 h-6 bg-white/30"></div>
            <div className="text-white/60 font-semibold">99.9% Uptime</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Landing
