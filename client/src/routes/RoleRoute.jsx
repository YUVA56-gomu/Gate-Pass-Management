import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Role-based route component
 * Protects routes based on user role
 */
export const RoleRoute = ({ children, allowedRoles }) => {
  const { hasRole, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleRoute
