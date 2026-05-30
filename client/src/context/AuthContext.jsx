import React, { createContext, useState, useEffect, useCallback } from 'react'
import * as authAPI from '../api/auth.api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Initialize authentication on app startup
   * Validates token with backend before restoring session
   */
  const initializeAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      // No stored credentials, skip validation
      if (!storedToken || !storedUser) {
        setLoading(false)
        return
      }

      // Set token temporarily to make API call
      // This allows axios interceptor to attach the token
      setToken(storedToken)

      // Validate token with backend
      try {
        const response = await authAPI.getCurrentUser()
        const userData = response.data

        // Token is valid, restore session
        setUser(userData)
        setToken(storedToken)
        setError(null)
      } catch (err) {
        // Token is invalid or expired
        const errorMessage = err.response?.data?.message || 'Session expired'

        // Clear invalid token and user
        setUser(null)
        setToken(null)
        setError(errorMessage)

        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        console.warn('Token validation failed:', errorMessage)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      setUser(null)
      setToken(null)
      setError('Failed to initialize authentication')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize auth on app startup
  useEffect(() => {
    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      const response = await authAPI.loginUser(email, password)

      const { user: userData, token: newToken } = response.data

      // Store in state
      setUser(userData)
      setToken(newToken)

      // Store in localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true, user: userData }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)

      // Clear any partial state on login failure
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      return { success: false, error: errorMessage }
    }
  }, [])

  // Register function
  const register = useCallback(async (name, email, password, phone) => {
    try {
      setError(null)
      const response = await authAPI.registerStudent({
        name,
        email,
        password,
        phone
      })

      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logoutUser()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state
      setUser(null)
      setToken(null)
      setError(null)

      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [])

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!token && !!user
  }, [token, user])

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }, [user])

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    setError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
