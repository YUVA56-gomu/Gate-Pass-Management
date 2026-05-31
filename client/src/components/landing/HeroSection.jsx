import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BubbleDecorations } from './BubbleDecorations'

export const HeroSection = () => {
  const navigate = useNavigate()
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)

  const messages = [
    'Apply Passes Online',
    'Track Approvals',
    'Generate QR Passes',
    'Download PDFs',
    'Verify Using QR',
    'Track Student Movement'
  ]

  useEffect(() => {
    const currentMessage = messages[textIndex]
    let charIndex = 0

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayText(currentMessage.substring(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % messages.length)
          setDisplayText('')
        }, 2000)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [textIndex])

  return (
    <section 
    id="home"
    className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Bubble Decorations */}
      <BubbleDecorations variant="hero" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full border border-blue-200/50">
              <span className="text-blue-600 font-semibold text-sm">✨ Secure • Smart • Digital</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 leading-tight mb-6 tracking-tight">
              Smart Gate Pass
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>

            {/* Typewriter Subtitle */}
            <div className="h-12 mb-8">
              <p className="text-xl md:text-2xl font-semibold text-gray-700 min-h-12">
                {displayText}
                <span className="animate-pulse">|</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg animate-fade-in-up stagger-1">
              Digital student leave and outpass management with QR-based verification. Apply online, track approvals, and monitor entry and exit securely.
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-10 animate-fade-in-up stagger-2">
              {[
                'Digital gate passes with QR codes',
                'Multi-level approval workflow',
                'Real-time student tracking',
                'Secure verification system'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-3">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 text-lg group flex items-center justify-center gap-2"
              >
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300 text-lg flex items-center justify-center gap-2"
              >
                Login
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Decorative bubbles */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in stagger-4">
            <div className="relative w-full h-96">
              {/* Additional decorative bubbles */}
              <div className="absolute top-10 right-10 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-bounce-slow"></div>
              <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-300 rounded-full opacity-15 animate-pulse-slow"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-bounce-slow"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-scroll-indicator">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-gray-600">Scroll to Explore</p>
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
