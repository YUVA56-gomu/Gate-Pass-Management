import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Landing = () => {
  const { isAuthenticated } = useAuth()

  // If already authenticated, redirect based on role
  if (isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Gate Pass Management
          </h1>
          <p className="text-gray-600">
            Digital College Gate Pass & Leave Management Platform
          </p>
        </div>

        {/* Description */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            Manage your college gate passes and leave requests efficiently. 
            Register as a student or login with your credentials.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg text-center transition duration-200"
          >
            Register
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            For college students, coordinators, hostel staff, and security personnel
          </p>
        </div>
      </div>
    </div>
  )
}

export default Landing
