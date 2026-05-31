import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Navbar } from '../../components/landing/Navbar'
import { HeroSection } from '../../components/landing/HeroSection'
import { WorkflowSection } from '../../components/landing/WorkflowSection'
import { SystemOverview } from '../../components/landing/SystemOverview'
import { FeaturesSection } from '../../components/landing/FeaturesSection'
import { PortalCards } from '../../components/landing/PortalCards'
import { Footer } from '../../components/landing/Footer'

export const Landing = () => {
  const { isAuthenticated } = useAuth()

  // If already authenticated, redirect to dashboard
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works - Workflow (moved to first after hero) */}
      <WorkflowSection />

      {/* System Overview */}
      <SystemOverview />

      {/* Features */}
      <FeaturesSection />

      {/* Role Portals */}
      <PortalCards />

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Landing
