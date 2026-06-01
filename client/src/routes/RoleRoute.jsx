import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Role-based route component
 * Protects routes based on user role
 * Uses Outlet to render nested routes in React Router v6
 */
export const RoleRoute = ({ allowedRoles }) => {
  const { hasRole, loading, isAuthenticated, user } = useAuth()

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
    // Redirect to the correct dashboard based on actual role
    const roleRedirects = {
      STUDENT: '/student/dashboard',
      COORDINATOR: '/coordinator/dashboard',
      HOSTEL_STAFF: '/hostel/dashboard',
      SECURITY: '/security/dashboard',
      ADMIN: '/admin/dashboard',
    }
    const redirect = user?.role ? (roleRedirects[user.role] || '/login') : '/login'
    console.warn(`[RoleRoute] Role mismatch. User role: ${user?.role}, allowed: ${allowedRoles}. Redirecting to ${redirect}`)
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}

export default RoleRoute
