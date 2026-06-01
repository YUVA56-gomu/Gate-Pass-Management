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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
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
